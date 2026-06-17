import { useCallback, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import TeacherSetup from './components/TeacherSetup';
import StudentJoin from './components/StudentJoin';
import WaitingRoom from './components/WaitingRoom';
import Classroom from './components/Classroom';
import Quiz from './components/Quiz';
import Results from './components/Results';
import { Flame } from 'lucide-react';
import { auth, signInWithGoogle, signOutUser, db } from './firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

const INITIAL_TOKENS = [
  {
    studentId: 'STU-2026-0811',
    fullName: 'Priya Sharma',
    sessionToken: 'STU-2026-0811_mock',
    strikeCount: 0,
    scores: [null, null, null, null, null, null]
  },
  {
    studentId: 'STU-2026-1049',
    fullName: 'Alex Carter',
    sessionToken: 'STU-2026-1049_mock',
    strikeCount: 0,
    scores: [null, null, null, null, null, null]
  }
];

function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('session') || params.has('code')) {
      return 'student-join';
    }
    return 'home';
  });
  const [classData, setClassData] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [sessionTokens, setSessionTokens] = useState(INITIAL_TOKENS);
  const [sessionLocked, setSessionLocked] = useState(false);
  const [user, setUser] = useState(null);
  
  // Topic Coordination, API Key, and Strikes tracking
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('classai_gemini_api_key') || '');
  const [unsplashClientId, setUnsplashClientId] = useState(() => localStorage.getItem('classai_unsplash_client_id') || '');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState(() => localStorage.getItem('classai_elevenlabs_api_key') || '');
  const [strikeCount, setStrikeCount] = useState(0);
  const [accumulatedQuizResults, setAccumulatedQuizResults] = useState({
    score: 0,
    total: 0,
    answers: []
  });
  const [topicExplanations, setTopicExplanations] = useState({});
  
  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore session state for student auto-navigation
  useEffect(() => {
    if (!db || !classData?.sessionCode || !studentInfo) return;

    const sessionDocRef = doc(db, "sessions", classData.sessionCode);
    const unsubscribe = onSnapshot(sessionDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        
        if (data.currentTopicIndex !== undefined && data.currentTopicIndex !== currentTopicIndex) {
          setCurrentTopicIndex(data.currentTopicIndex);
        }
        
        if (data.status === 'waiting') {
          setCurrentScreen('waiting-room');
        } else if (data.status === 'teaching') {
          setCurrentScreen('classroom');
        } else if (data.status === 'quiz') {
          setCurrentScreen('quiz');
        } else if (data.status === 'results') {
          setCurrentScreen('results');
        }
      }
    });

    return () => unsubscribe();
  }, [classData?.sessionCode, studentInfo, currentTopicIndex]);

  const handleLogin = async () => {
    // Instant login bypass to prevent Firebase Key issues from blocking development
    const mockUser = {
      displayName: "Jane Doe (Teacher)",
      email: "jane.doe@university.edu",
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=Jane`,
      uid: "mock-google-uid-teacher",
    };
    setUser(mockUser);
    setCurrentScreen('teacher-setup');
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setCurrentScreen('home');
    } catch (err) {
      console.error("Firebase Signout failed:", err);
    }
  };



  const navigate = (screen) => setCurrentScreen(screen);

  const handleTopicExplanationReady = useCallback((topicIndex, paragraphs) => {
    setTopicExplanations((prev) => ({
      ...prev,
      [topicIndex]: paragraphs,
    }));
  }, []);

  const handleStudentJoin = (info, fetchedClassData = null) => {
    if (fetchedClassData) {
      setClassData(fetchedClassData);
    }
    const token = info.sessionToken || (info.studentId + '_' + Date.now());
    const enrichedInfo = { 
      ...info, 
      sessionToken: token,
      strikeCount: info.strikeCount || 0,
      scores: info.scores || [null, null, null, null, null, null]
    };
    setStudentInfo(enrichedInfo);
    setSessionTokens((prev) => {
      const exists = prev.some((t) => t.studentId === info.studentId);
      if (exists) {
        return prev.map((t) => t.studentId === info.studentId ? enrichedInfo : t);
      }
      return [...prev, enrichedInfo];
    });
  };

  const handleRejoin = (studentId) => {
    const found = sessionTokens.find((t) => t.studentId === studentId);
    if (found) {
      setStudentInfo(found);
      setStrikeCount(found.strikeCount || 0); // Restore their strikes
      return true;
    }
    return false;
  };

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('classai_gemini_api_key', newKey);
  };

  const handleSaveUnsplashClientId = (newId) => {
    setUnsplashClientId(newId);
    localStorage.setItem('classai_unsplash_client_id', newId);
  };

  const handleSaveElevenLabsApiKey = (newKey) => {
    setElevenLabsApiKey(newKey);
    localStorage.setItem('classai_elevenlabs_api_key', newKey);
  };

  const handleQuizResults = (results) => {
    const isStrike = results.score === 0;
    const newStrikeVal = isStrike ? strikeCount + 1 : strikeCount;

    // 1. Update active student info
    setStudentInfo((prev) => {
      if (!prev) return null;
      const nextScores = [...(prev.scores || [null, null, null, null, null, null])];
      nextScores[currentTopicIndex] = results.score;
      
      const updatedInfo = {
        ...prev,
        strikeCount: newStrikeVal,
        scores: nextScores
      };

      // Write student scores to Firestore if database is online
      if (db && classData?.sessionCode && prev.studentId) {
        updateDoc(doc(db, "sessions", classData.sessionCode, "students", prev.studentId), {
          scores: nextScores,
          strikeCount: newStrikeVal
        }).catch(err => console.error("Firestore student scores update failed:", err));
      }

      return updatedInfo;
    });

    setStrikeCount(newStrikeVal);

    // 2. Simulate mock student scores for this quiz
    const priyaScore = Math.floor(Math.random() * 2) + 2; // Priya: 2 or 3
    const alexScore = Math.floor(Math.random() * 4);      // Alex: 0, 1, 2, or 3

    // 3. Keep database (sessionTokens) synced
    setSessionTokens((prev) =>
      prev.map((tok) => {
        // Active student
        if (studentInfo && tok.studentId === studentInfo.studentId) {
          const nextScores = [...(tok.scores || [null, null, null, null, null, null])];
          nextScores[currentTopicIndex] = results.score;
          return {
            ...tok,
            strikeCount: newStrikeVal,
            scores: nextScores
          };
        }
        // Mock Priya
        if (tok.studentId === 'STU-2026-0811') {
          const nextScores = [...(tok.scores || [null, null, null, null, null, null])];
          nextScores[currentTopicIndex] = priyaScore;
          const isPriyaStrike = priyaScore === 0;
          return {
            ...tok,
            scores: nextScores,
            strikeCount: isPriyaStrike ? tok.strikeCount + 1 : tok.strikeCount
          };
        }
        // Mock Alex
        if (tok.studentId === 'STU-2026-1049') {
          const nextScores = [...(tok.scores || [null, null, null, null, null, null])];
          nextScores[currentTopicIndex] = alexScore;
          const isAlexStrike = alexScore === 0;
          return {
            ...tok,
            scores: nextScores,
            strikeCount: isAlexStrike ? tok.strikeCount + 1 : tok.strikeCount
          };
        }
        return tok;
      })
    );

    // 4. Update overall statistics
    setAccumulatedQuizResults((prev) => ({
      score: prev.score + results.score,
      total: prev.total + results.total,
      answers: [...prev.answers, ...results.answers],
    }));
  };

  const handleQuizNext = () => {
    const totalTopics = classData?.topics?.length || 6;
    if (currentTopicIndex < totalTopics - 1) {
      const nextTopic = currentTopicIndex + 1;
      setCurrentTopicIndex(nextTopic);
      setCurrentScreen('classroom');

      // If teacher, update Firestore status
      if (db && classData?.sessionCode && !studentInfo) {
        updateDoc(doc(db, "sessions", classData.sessionCode), {
          status: 'teaching',
          currentTopicIndex: nextTopic
        }).catch(err => console.error("Firestore next topic transition failed:", err));
      }
    } else {
      setCurrentScreen('results');

      // If teacher, update Firestore status
      if (db && classData?.sessionCode && !studentInfo) {
        updateDoc(doc(db, "sessions", classData.sessionCode), {
          status: 'results'
        }).catch(err => console.error("Firestore results transition failed:", err));
      }
    }
  };

  const handleRestart = () => {
    setCurrentScreen('teacher-setup');
    setClassData(null);
    setStudentInfo(null);
    setSessionTokens(INITIAL_TOKENS);
    setSessionLocked(false);
    setCurrentTopicIndex(0);
    setStrikeCount(0);
    setAccumulatedQuizResults({
      score: 0,
      total: 0,
      answers: []
    });
    setTopicExplanations({});
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <Home
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onNavigate={navigate}
          />
        );
      case 'teacher-setup':
        return (
          <TeacherSetup
            onNext={() => navigate('student-join')}
            onClassData={setClassData}
          />
        );
      case 'student-join':
        return (
          <StudentJoin
            onNext={() => {
              if (sessionLocked) {
                // If session is locked mid-class, drop student back into the classroom
                setCurrentScreen('classroom');
              } else {
                setCurrentScreen('waiting-room');
              }
            }}
            classData={classData}
            sessionLocked={sessionLocked}
            onStudentJoin={handleStudentJoin}
            onRejoin={handleRejoin}
          />
        );
      case 'waiting-room':
        return (
          <WaitingRoom
            onNext={() => navigate('classroom')}
            classData={classData}
            studentInfo={studentInfo}
            onSessionLock={() => setSessionLocked(true)}
            elevenLabsApiKey={elevenLabsApiKey}
          />
        );
      case 'classroom':
        return (
          <Classroom
            key={currentTopicIndex}
            currentTopicIndex={currentTopicIndex}
            classData={classData}
            apiKey={apiKey}
            onSaveApiKey={handleSaveApiKey}
            unsplashClientId={unsplashClientId}
            onSaveUnsplashClientId={handleSaveUnsplashClientId}
            elevenLabsApiKey={elevenLabsApiKey}
            onSaveElevenLabsApiKey={handleSaveElevenLabsApiKey}
            onNext={() => navigate('quiz')}
            onExplanationReady={handleTopicExplanationReady}
            studentInfo={studentInfo}
          />
        );
      case 'quiz':
        return (
          <Quiz
            key={currentTopicIndex}
            topicName={classData?.topics?.[currentTopicIndex] || 'Selected Topic'}
            lessonParagraphs={topicExplanations[currentTopicIndex]}
            apiKey={apiKey}
            onNext={handleQuizNext}
            onQuizResults={handleQuizResults}
            studentInfo={studentInfo}
          />
        );
      case 'results':
        return (
          <Results
            classData={classData}
            quizResults={accumulatedQuizResults}
            strikeCount={strikeCount}
            sessionTokens={sessionTokens}
            onRestart={handleRestart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Animated background grid */}
      <div className="bg-grid" />

      {/* Main app */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          currentScreen={currentScreen} 
          onNavigate={navigate} 
          studentInfo={studentInfo}
          strikeCount={strikeCount}
          classData={classData}
          user={user}
          onLogout={handleLogout}
          onLogin={handleLogin}
        />
        <main className="flex-1 flex flex-col relative">
          <div key={currentScreen} className="flex-1 flex flex-col animate-fade-in">
            {renderScreen()}
          </div>
        </main>
      </div>

      {/* Persistent strikes absent modal overlay */}
      {studentInfo && studentInfo.strikeCount >= 3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass p-8 max-w-sm w-full text-center relative z-10 animate-slide-up border border-error/20">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-error/15 border border-error/25">
              <Flame size={26} className="text-error fill-error animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-display">
              Absent Notice
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              You have been marked absent. Your session has ended.
            </p>
            <button
              type="button"
              onClick={() => {
                // Remove student details and return to login screen
                setStudentInfo(null);
                setCurrentScreen('student-join');
              }}
              className="btn-primary w-full bg-gradient-to-r from-error to-cyber-pink hover:scale-105 border-none cursor-pointer font-bold text-sm py-2.5 rounded-xl shadow-lg"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
