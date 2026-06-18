import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  MessageSquare,
  Send,
  Check,
  Sparkles,
  AlertTriangle,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
} from 'lucide-react';

// Fallback high-quality curated lecture segments with media captions if Gemini is offline
const getCuratedSegments = (topic) => {
  const lower = topic.toLowerCase();
  
  if (lower.includes('neural') || lower.includes('network') || lower.includes('perceptron') || lower.includes('neuron')) {
    return [
      {
        title: "Structure of Artificial Neurons",
        lectureText: "Hello class, welcome to today's session! Let's start by looking at artificial neurons. Just like the neurons in your brain, an artificial neuron receives input values, multiplies them by connection weights, adds a bias, and passes them through an activation function to generate an output. Let's look at this diagram illustrating this core structure.",
        mediaType: "image",
        mediaQuery: "artificial neural network node mathematical model",
        caption: "A diagram of an artificial neuron: multiplying inputs by weights, adding bias, and passing through an activation function.",
        keyTakeaway: "Artificial neurons calculate weighted sums plus bias, applying an activation function."
      },
      {
        title: "The Role of Activation Functions",
        lectureText: "Now, why do we need activation functions? Without them, a neural network is just a giant linear formula, which can't learn complex curves or patterns. Activation functions like ReLU and Sigmoid introduce non-linearity, allowing the model to fit complex data boundaries. Watch this short video explaining how activation functions shape neural outputs.",
        mediaType: "video",
        mediaQuery: "activation functions relu sigmoid deep learning",
        caption: "A process animation showing how activation functions introduce non-linearity to map curves.",
        keyTakeaway: "Activation functions introduce non-linearity to model complex decision boundaries."
      },
      {
        title: "Backpropagation and Optimization",
        lectureText: "Finally, how does the network learn? Through backpropagation. It calculates the error at the output using a loss function, and propagates the gradients backwards using the chain rule. Then, gradient descent adjusts the weights to minimize error. Let's view this visualization of gradient descent rolling down a cost landscape to find the minimum error.",
        mediaType: "image",
        mediaQuery: "gradient descent landscape optimization curve",
        caption: "A topological cost landscape visualization with a gradient vector path leading down to the global minimum.",
        keyTakeaway: "Backpropagation propagates error gradients backward to update weights via gradient descent."
      }
    ];
  }

  if (lower.includes('supervised') || lower.includes('regression') || lower.includes('classif')) {
    return [
      {
        title: "Introduction to Supervised Learning",
        lectureText: "Welcome class! Today we are discussing Supervised Learning. This is the most common form of machine learning, where we train an algorithm using labeled training data. Each example contains an input and its corresponding correct output target. Let's see an overview diagram of how training data shapes the mapping function.",
        mediaType: "image",
        mediaQuery: "supervised machine learning training data diagram",
        caption: "A conceptual diagram showing training inputs mapped to target labels to train a classifier.",
        keyTakeaway: "Supervised learning maps inputs to outputs using labeled training examples."
      },
      {
        title: "Classification vs Regression",
        lectureText: "Supervised learning is divided into classification, which predicts discrete categories like spam versus inbox, and regression, which predicts continuous values like stock prices or temperature. Let's watch this quick visual breakdown comparing classification boundaries against regression lines.",
        mediaType: "video",
        mediaQuery: "classification vs regression machine learning",
        caption: "An animation showing classification boundaries mapping categories vs a regression line fitting continuous data.",
        keyTakeaway: "Classification predicts discrete categories, while regression predicts continuous numerical values."
      },
      {
        title: "Evaluating Model Performance",
        lectureText: "Once trained, we must test the model on separate data it has never seen before. We measure its performance using indicators like accuracy, precision, and recall. This ensures our model doesn't just memorize the training set. Let's look at a typical evaluation report displaying precision curves.",
        mediaType: "image",
        mediaQuery: "machine learning evaluation precision confusion matrix",
        caption: "An evaluation metrics board displaying a confusion matrix, precision rating, and recall parameters.",
        keyTakeaway: "Model evaluation checks generalization using precision, recall, and accuracy metrics."
      }
    ];
  }

  // General default fallback segments
  return [
    {
      title: `Introduction to ${topic}`,
      lectureText: `Welcome to our session on ${topic}! Understanding the foundations of this subject is essential for analyzing complex systems. Today, we will explore the core concepts step-by-step to build a robust mental model. Let's start with this conceptual diagram outlining the boundary conditions of this study.`,
      mediaType: "image",
      mediaQuery: `${topic} concept diagram schematic`,
      caption: `A schematic diagram illustrating the primary boundary conditions of ${topic}.`,
      keyTakeaway: `Establish foundational definitions and boundary conditions of ${topic}.`
    },
    {
      title: "Core Mechanics and Real-World Applications",
      lectureText: `Now, let's explore how ${topic} operates in real-world environments. Theoretical models often assume ideal conditions, but in practice, factors like resistance, noise, or external variables affect the system. Let's watch this video showing these variables in action and explaining how they interact.`,
      mediaType: "video",
      mediaQuery: `${topic} explanation demonstration video`,
      caption: `A demonstration video illustrating active variables and interactions in a practical system.`,
      keyTakeaway: `Analyze empirical observations and environmental factors affecting the system.`
    },
    {
      title: "Synthesis and Future Outlook",
      lectureText: `Finally, let's synthesize these ideas. By connecting the mathematical foundations with empirical observations, we can solve complex analytical problems. As we prepare to check our knowledge, take a look at this overview showing the future trends and integrated applications of this subject.`,
      mediaType: "image",
      mediaQuery: `${topic} futuristic technology concept`,
      caption: `A visualization of emerging technological frameworks and future applications of ${topic}.`,
      keyTakeaway: `Synthesize formulas and observations to solve multi-variable case studies.`
    }
  ];
};

const cleanJsonString = (rawText) => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  }
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    cleaned = cleaned.slice(arrayStart, arrayEnd + 1);
  }
  return cleaned;
};

// Curated educational video lookup database
const getFallbackYoutubeId = (query) => {
  const q = query.toLowerCase();
  if (q.includes('neural') || q.includes('neuron') || q.includes('perceptron')) return 'aircAruvnKk';
  if (q.includes('activation') || q.includes('relu') || q.includes('sigmoid')) return 'gYpoJMIdxux';
  if (q.includes('backprop') || q.includes('gradient')) return 'Ilg3gGewQ5U';
  if (q.includes('supervised') || q.includes('classification')) return '7VeUPuFGJHk';
  if (q.includes('unsupervised') || q.includes('cluster')) return 'FakbGcyshyw';
  if (q.includes('decision') || q.includes('forest')) return '7VeUPuFGJHk';
  if (q.includes('overfit') || q.includes('bias')) return 'Q81RR3yKn30';
  return 'aircAruvnKk';
};

export default function Classroom({
  onNext,
  classData,
  apiKey,
  unsplashClientId,
  currentTopicIndex = 0,
  onExplanationReady,
  studentInfo,
}) {
  const topicName = classData?.topics?.[currentTopicIndex] || 'Selected Topic';

  // Environment variables YouTube key
  const youtubeApiKey = typeof process !== 'undefined' && process.env?.YOUTUBE_API_KEY || import.meta.env?.VITE_YOUTUBE_API_KEY || '';

  // Pre-join state
  const [preJoined, setPreJoined] = useState(false);
  const [displayName, setDisplayName] = useState(studentInfo?.fullName || 'Student');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);

  // Classroom state
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(-1);
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false);
  const [sharedImage, setSharedImage] = useState(null);
  
  // YouTube player states
  const [sharedVideoId, setSharedVideoId] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [channelName, setChannelName] = useState('');
  const [useFallbackLink, setUseFallbackLink] = useState(false);
  const [youtubeQuotaExhausted, setYoutubeQuotaExhausted] = useState(false);
  const youtubeCacheRef = useRef({}); // Caches search queries
  const activeSegment = segments[currentSegmentIdx];

  // Interrupt / Resume states
  const [isAnsweringQuestion, setIsAnsweringQuestion] = useState(false);
  const [teacherAnsweringText, setTeacherAnsweringText] = useState('');

  // Panels state
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Priya Sharma', text: `Hi class! Excited to learn about ${topicName} today.`, time: '10:02 AM', isSelf: false },
    { sender: 'Alex Chen', text: 'Me too. Hope the video examples make the mechanics clear.', time: '10:03 AM', isSelf: false }
  ]);

  // Audio settings
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);

  // Refs for tracking active speaking state
  const utteranceRef = useRef(null);
  const localStreamRef = useRef(null);
  const ttsTimeoutRef = useRef(null);
  const playerRef = useRef(null);
  const chatInputRef = useRef(null);

  // Start pre-join camera stream
  useEffect(() => {
    let active = true;
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (active) {
          setLocalStream(stream);
          localStreamRef.current = stream;
        }
      } catch (err) {
        console.warn("Webcam permissions not granted or camera unavailable:", err);
      }
    };
    initCamera();
    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Update tracks enabled based on toggles
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = cameraOn; });
    }
  }, [cameraOn, localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = micOn; });
    }
  }, [micOn, localStream]);

  // Control YouTube Player API play/pause based on active interruption
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.pauseVideo !== 'function') return;
    try {
      if (isAnsweringQuestion) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (e) {
      console.warn("YouTube Player play/pause control error:", e);
    }
  }, [isAnsweringQuestion]);

  // Load YouTube IFrame Player API and initialize player
  useEffect(() => {
    if (activeSegment?.mediaType !== 'video' || !sharedVideoId) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let checkInterval = null;

    const createYTPlayer = () => {
      if (!isMounted) return;
      
      const container = document.getElementById('youtube-player-container');
      if (!container) {
        setTimeout(createYTPlayer, 100);
        return;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }

      try {
        playerRef.current = new window.YT.Player('youtube-player-container', {
          videoId: sharedVideoId,
          playerVars: {
            autoplay: 1,
            origin: window.location.origin,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onError: (event) => {
              console.warn("YouTube Player error, falling back:", event.data);
              if (isMounted) setUseFallbackLink(true);
            }
          }
        });
      } catch (err) {
        console.error("Failed to create YT.Player:", err);
        if (isMounted) setUseFallbackLink(true);
      }
    };

    if (!window.YT) {
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          createYTPlayer();
        }
      }, 100);
    } else {
      createYTPlayer();
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [sharedVideoId, activeSegment?.mediaType]);

  // Callback ref for streaming the user camera preview
  const userVideoRef = useCallback((node) => {
    if (node && localStream) {
      node.srcObject = localStream;
    }
  }, [localStream]);

  // Initialize Lecture segments via Gemini or preloaded fallbacks
  const loadSegments = async () => {
    setLoading(true);
    let generated = null;

    if (apiKey) {
      const prompt = `You are a world-class AI professor. Teach a lesson on the topic: "${topicName}". 
Break this lesson down into exactly 3 sequential segments.
For each segment, write:
1. A descriptive title.
2. The spoken explanation text (approx. 50-70 words). This will be read aloud via Text-to-Speech. Speak directly to the students.
3. The media type: either "image" or "video". Decide this media type based on the content:
   - For a concept explanation, general description, formula, or static diagram, choose "image".
   - For a process breakdown, demonstration, experiment walkthrough, or historical event, choose "video".
4. A search query to fetch the image (from Unsplash) or search a video (on YouTube) (2-3 key search terms).
5. A brief visual caption (1 sentence) explaining what the visual content is displaying.
6. A single brief bullet point summarizing the key takeaway.

Return ONLY a valid JSON array matching this structure:
[
  {
    "title": "Segment Title",
    "lectureText": "Spoken text...",
    "mediaType": "image",
    "mediaQuery": "unsplash search query",
    "caption": "Caption describing the visual...",
    "keyTakeaway": "takeaway point"
  },
  {
    "title": "Segment Title",
    "lectureText": "Spoken text...",
    "mediaType": "video",
    "mediaQuery": "youtube search query",
    "caption": "Caption describing what the video demonstrates...",
    "keyTakeaway": "takeaway point"
  }
]`;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const cleaned = cleanJsonString(text);
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed) && parsed.length > 0) {
              generated = parsed;
            }
          }
        }
      } catch (err) {
        console.error("Gemini classroom segments query failed, falling back to curated slides:", err);
      }
    }

    const finalSegments = generated || getCuratedSegments(topicName);
    setSegments(finalSegments);
    setLoading(false);

    // Sync with App parent so Quiz knows the lesson context
    const syncedSlides = finalSegments.map((s) => ({
      title: s.title,
      bulletPoints: [s.keyTakeaway],
      speakerNotes: s.lectureText,
      visualDescription: s.mediaQuery
    }));
    onExplanationReady?.(currentTopicIndex, syncedSlides);

    // Auto trigger first segment index
    setCurrentSegmentIdx(0);
  };

  // Start teaching when preJoin is completed
  const handleJoin = () => {
    setPreJoined(true);
    loadSegments();
  };

  // Fetch Unsplash Image matching media query
  const loadUnsplashImage = async (query) => {
    if (!unsplashClientId) return;
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${unsplashClientId}`
      );
      if (res.ok) {
        const data = await res.json();
        const url = data?.results?.[0]?.urls?.regular;
        if (url) {
          setSharedImage(url);
          return;
        }
      }
    } catch (err) {
      console.warn("Unsplash image load failed:", err);
    }
    // General placeholder fallback
    setSharedImage(`https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop`);
  };

  // Load YouTube Video via API v3 with quota caching
  const loadYoutubeVideo = async (query) => {
    setVideoTitle('');
    setVideoThumbnail('');
    setChannelName('');
    setSharedVideoId(null);
    setUseFallbackLink(false);

    // 1. Check Cache
    if (youtubeCacheRef.current[query]) {
      const cached = youtubeCacheRef.current[query];
      setSharedVideoId(cached.videoId);
      setVideoTitle(cached.title);
      setChannelName(cached.channelName);
      setVideoThumbnail(cached.thumbnail);
      setUseFallbackLink(cached.useFallbackLink || false);
      return;
    }

    // 2. Fallback if no API key is set in environment
    if (!youtubeApiKey) {
      console.warn("YOUTUBE_API_KEY environment variable is missing. Using local fallback.");
      const fallbackId = getFallbackYoutubeId(query);
      const title = `Demonstrating: ${query}`;
      const channel = `Educational Resource`;
      const thumb = `https://img.youtube.com/vi/${fallbackId}/maxresdefault.jpg`;
      
      setSharedVideoId(fallbackId);
      setVideoTitle(title);
      setChannelName(channel);
      setVideoThumbnail(thumb);
      setUseFallbackLink(false);
      
      youtubeCacheRef.current[query] = {
        videoId: fallbackId,
        title,
        channelName: channel,
        thumbnail: thumb,
        useFallbackLink: false
      };
      return;
    }

    // 3. Query YouTube Data API v3
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&relevanceLanguage=en&safeSearch=strict&key=${youtubeApiKey}`
      );

      if (res.status === 403) {
        console.warn("YouTube Data API Quota Exceeded (Status 403). Activating fallback watcher UI.");
        setYoutubeQuotaExhausted(true);
        triggerYoutubeFallback(query);
        return;
      }

      if (!res.ok) {
        throw new Error(`YouTube API returned status ${res.status}`);
      }

      const data = await res.json();
      const items = data.items || [];

      if (items.length > 0) {
        const item = items[0];
        const videoId = item.id?.videoId;
        const title = item.snippet?.title || `Process Demo: ${query}`;
        const channel = item.snippet?.channelTitle || `YouTube Educator`;
        const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        if (videoId) {
          setSharedVideoId(videoId);
          setVideoTitle(title);
          setChannelName(channel);
          setVideoThumbnail(thumb);
          setUseFallbackLink(false);

          youtubeCacheRef.current[query] = {
            videoId,
            title,
            channelName: channel,
            thumbnail: thumb,
            useFallbackLink: false
          };
          return;
        }
      }

      // No videos found, load fallback
      triggerYoutubeFallback(query);
    } catch (err) {
      console.error("YouTube search request failed, trigger fallback:", err);
      triggerYoutubeFallback(query);
    }
  };

  const triggerYoutubeFallback = (query) => {
    const fallbackId = getFallbackYoutubeId(query);
    const title = `Reference Video: ${query}`;
    const channel = `Academic Reference`;
    const thumb = `https://img.youtube.com/vi/${fallbackId}/maxresdefault.jpg`;
    
    setSharedVideoId(fallbackId);
    setVideoTitle(title);
    setChannelName(channel);
    setVideoThumbnail(thumb);
    setUseFallbackLink(true);

    youtubeCacheRef.current[query] = {
      videoId: fallbackId,
      title,
      channelName: channel,
      thumbnail: thumb,
      useFallbackLink: true
    };
  };

  // Run the current lecture segment (displays image/video + plays voice)
  useEffect(() => {
    if (currentSegmentIdx === -1 || segments.length === 0 || isAnsweringQuestion) return;
    
    const segment = segments[currentSegmentIdx];
    
    // 1. Update main area media
    if (segment.mediaType === 'image') {
      setSharedVideoId(null);
      loadUnsplashImage(segment.mediaQuery);
    } else {
      setSharedImage(null);
      loadYoutubeVideo(segment.mediaQuery);
    }

    // 2. Play speech narration
    speakLectureText(segment.lectureText, () => {
      // Trigger next segment advance when done
      advanceSegment();
    });

    return () => {
      if (ttsTimeoutRef.current) clearTimeout(ttsTimeoutRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [currentSegmentIdx, segments, isAnsweringQuestion]);

  // Unified speech synthesiser
  const speakLectureText = (text, onFinished) => {
    if (ttsTimeoutRef.current) clearTimeout(ttsTimeoutRef.current);
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      utterance.rate = 0.90;
      utterance.volume = isMuted ? 0 : volume;

      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (engVoice) utterance.voice = engVoice;

      utterance.onstart = () => {
        setAiIsSpeaking(true);
      };

      utterance.onend = () => {
        setAiIsSpeaking(false);
        // Natural pause before executing callback
        ttsTimeoutRef.current = setTimeout(() => {
          onFinished();
        }, 3000);
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        setAiIsSpeaking(false);
        // Fallback timer if audio blocked
        ttsTimeoutRef.current = setTimeout(() => {
          onFinished();
        }, text.length * 75);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setAiIsSpeaking(true);
      ttsTimeoutRef.current = setTimeout(() => {
        setAiIsSpeaking(false);
        onFinished();
      }, text.length * 80);
    }
  };

  // Advance state
  const advanceSegment = () => {
    if (currentSegmentIdx < segments.length - 1) {
      setCurrentSegmentIdx(prev => prev + 1);
    } else {
      // Lesson fully complete -> announce and transition to quiz
      speakLectureText(
        "That concludes our Zoom lecture on this topic. Please complete the quiz to evaluate your understanding.",
        () => {
          onNext();
        }
      );
    }
  };

  // Handle Question interruption
  const pauseAndAnswerQuestion = async (question) => {
    setIsAnsweringQuestion(true);
    setAiIsSpeaking(true);
    
    if (ttsTimeoutRef.current) clearTimeout(ttsTimeoutRef.current);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (videoRef.current) videoRef.current.pause();

    // 1. Add thinking message
    const thinkingMsg = { sender: 'AI Teacher', text: 'Thinking...', time: 'Just now', isSelf: false };
    setChatMessages(prev => [...prev, thinkingMsg]);

    let answerText = "";

    // 2. Fetch answer using Gemini
    if (apiKey) {
      const answerPrompt = `You are a world-class AI professor teaching the topic: "${topicName}". A student has just asked this question during class: "${question}".
      Write a brief, direct, and helpful answer (approx. 40-50 words) explaining the concept clearly. Speak directly to the student. Do not wrap in markdown or add extra headers.`;
      
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: answerPrompt }] }],
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        }
      } catch (err) {
        console.warn("AI answer generation failed, using mock:", err);
      }
    }

    // 3. Fallback answers
    if (!answerText) {
      const qLower = question.toLowerCase();
      if (qLower.includes('how') || qLower.includes('work')) {
        answerText = `Good question! In the context of ${topicName}, this system works by establishing connection rules. Weights and features adjust dynamically to capture input signals and minimize error.`;
      } else if (qLower.includes('why') || qLower.includes('purpose') || qLower.includes('reason')) {
        answerText = `Excellent query. We need this mechanism in ${topicName} to ensure the model generalizes well to new, unseen environments and avoids learning noise or irrelevant variables.`;
      } else {
        answerText = `That's an insightful point about ${topicName}. It highlights how different features interact under boundary conditions. We evaluate this using precision metrics to ensure stability.`;
      }
    }

    setTeacherAnsweringText(answerText);

    // Replace "Thinking..." with actual answer
    setChatMessages(prev => {
      const updated = [...prev];
      if (updated[updated.length - 1]?.text === 'Thinking...') {
        updated[updated.length - 1] = { sender: 'AI Teacher', text: answerText, time: 'Just now', isSelf: false };
      }
      return updated;
    });

    // 4. Speak the answer, and then resume
    speakLectureText(answerText, () => {
      // Clear answering state and resume current segment lecture
      setTeacherAnsweringText('');
      setIsAnsweringQuestion(false);
      if (videoRef.current) videoRef.current.play();
    });
  };

  // Chat message submission
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    const newMsg = { 
      sender: displayName, 
      text: query, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      isSelf: true 
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    pauseAndAnswerQuestion(query);
  };

  // Leave Class handle
  const handleLeaveClass = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    onNext(); // Advance or exit
  };

  // ─── Phase 1: Pre-Join Room Screen ──────────────────────────────────────────
  if (!preJoined) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative bg-[#0B0D19]">
        <div className="orb orb-blue w-96 h-96 -top-24 -left-20" />
        <div className="orb orb-purple w-96 h-96 -bottom-24 -right-20" />

        <div className="w-full max-w-4xl glass border border-slate-200/80 shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10 rounded-2xl min-h-[480px]">
          {/* Camera preview frame */}
          <div className="md:w-3/5 bg-slate-900/60 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative">
            <div className="text-xs text-slate-400 font-mono tracking-wider mb-3 select-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              CAMERA & AUDIO PREVIEW
            </div>

            <div className="flex-1 rounded-xl bg-slate-950 overflow-hidden relative border border-slate-800 flex items-center justify-center min-h-[240px]">
              {cameraOn && localStream ? (
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-4 select-none">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
                    <VideoOff size={24} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium font-sans">
                    Camera is turned off
                  </p>
                </div>
              )}

              {/* User indicator name tag overlay */}
              <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-880 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-white">
                {displayName}
              </div>
            </div>

            {/* Media toggle toggles */}
            <div className="flex justify-center gap-4 mt-5">
              <button
                type="button"
                onClick={() => setMicOn(prev => !prev)}
                className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all border-none ${
                  micOn 
                    ? 'bg-slate-800 text-white hover:bg-slate-700' 
                    : 'bg-error text-white hover:bg-error/95 shadow-lg shadow-error/20'
                }`}
                title={micOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button
                type="button"
                onClick={() => setCameraOn(prev => !prev)}
                className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all border-none ${
                  cameraOn 
                    ? 'bg-slate-800 text-white hover:bg-slate-700' 
                    : 'bg-error text-white hover:bg-error/95 shadow-lg shadow-error/20'
                }`}
                title={cameraOn ? "Disable Camera" : "Enable Camera"}
              >
                {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
            </div>
          </div>

          {/* Join settings form */}
          <div className="md:w-2/5 p-8 flex flex-col justify-center select-none text-left">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-600 text-xs font-semibold mb-3">
                <Sparkles size={13} />
                <span>Zoom Classroom Portal</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none font-display">
                Ready to Join?
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Connect to topic: <span className="text-accent-600 font-bold">{topicName}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2 font-mono">
                  Your Meeting Display Name
                </label>
                <input
                  type="text"
                  className="input-dark bg-white/70"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name..."
                />
              </div>

              <button
                type="button"
                onClick={handleJoin}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-lg shadow-accent-500/25 border-none cursor-pointer hover:scale-102 transition-all"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-600), var(--color-accent-500))' }}
              >
                <span>Join Meeting</span>
                <Check size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Phase 2: Zoom-Style Meeting Room Screen ──────────────────────────────────

  return (
    <div className="flex-1 flex flex-col bg-[#0B0D16] text-white relative select-none">
      
      {/* Top Header Bar */}
      <div className="h-14 bg-slate-950/80 border-b border-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-600 to-cyber-purple flex items-center justify-center font-display font-bold text-sm text-white">
            Z
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              {classData?.title || 'ClassAI Room'}
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Lecture Topic: {topicName} ({currentSegmentIdx + 1}/{segments.length})
            </p>
          </div>
        </div>

        {/* Live sharing status indicator */}
        {activeSegment && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-[10px] font-bold tracking-wider font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping shrink-0" />
            AI TEACHER IS SHARING
          </div>
        )}
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Column: Large Shared Content Zone */}
        <div className="flex-1 bg-[#090A10] p-4 flex flex-col justify-between relative overflow-hidden">
          {loading ? (
            <div className="m-auto text-center">
              <div className="w-10 h-10 rounded-full border-4 border-slate-700 border-t-accent-500 animate-spin mb-3 mx-auto" />
              <p className="text-xs text-slate-500 font-mono">Formulating AI lecture segments...</p>
            </div>
          ) : activeSegment ? (
            <div className="w-full h-full flex flex-col justify-between max-w-5xl mx-auto relative z-10 animate-fade-in">
              
              {/* Media Container box */}
              <div className="flex-1 rounded-2xl bg-slate-950/90 overflow-hidden border border-slate-800/80 relative flex items-center justify-center shadow-2xl shadow-black/60 group">
                {activeSegment.mediaType === 'image' && sharedImage ? (
                  <img
                    src={sharedImage}
                    alt={activeSegment.title}
                    className="w-full h-full object-contain object-center transition-all duration-700 group-hover:scale-102"
                  />
                ) : activeSegment.mediaType === 'video' && sharedVideoId ? (
                  <div className="w-full h-full flex flex-col justify-between bg-slate-950/80 relative z-10 select-none overflow-hidden animate-fade-in">
                    {/* Proper video player playing from the proxy */}
                    <div className="w-full flex-1 bg-black relative min-h-0">
                      <video 
                        ref={videoRef}
                        src={`/api/youtube-proxy?videoId=${sharedVideoId}`}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        preload="auto"
                      />
                    </div>
                    
                    {/* Details section below */}
                    <div className="p-5 border-t border-slate-900 bg-slate-950/95 flex flex-col select-none text-left shrink-0">
                      <h4 className="text-base font-bold text-white leading-snug truncate">
                        {videoTitle || `Watch Video: ${activeSegment.title}`}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-sans">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent-500/20 text-accent-500 flex items-center justify-center font-mono font-bold text-[8px]">C</span>
                        {channelName || `Educational Creator`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-650">
                    <Sparkles size={28} className="animate-spin mx-auto mb-2 opacity-30 text-accent-500" />
                    <span className="text-xs font-mono">Synchronizing shared feed...</span>
                  </div>
                )}

                {/* Subtopic Banner overlay */}
                <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-xl text-left">
                  <span className="text-[9px] text-accent-500 uppercase tracking-widest font-mono font-bold">Lecture Topic</span>
                  <h3 className="text-sm font-bold text-white tracking-wide mt-0.5">{activeSegment.title}</h3>
                </div>

                {/* Visual description caption box (Always visible below the main content/banner area) */}
                {activeSegment.caption && (
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 border border-slate-850 backdrop-blur-md px-3.5 py-2 rounded-xl text-left shadow-lg">
                    <span className="text-[9px] font-bold text-accent-500 font-mono uppercase tracking-wider block mb-0.5">Visual Caption</span>
                    <p className="text-slate-300 text-xs leading-normal font-sans">{activeSegment.caption}</p>
                  </div>
                )}
              </div>

              {/* Subtitles / AI Professor narration transcription at the bottom */}
              <div className="h-16 mt-3 shrink-0 flex items-center justify-center px-6 rounded-xl bg-slate-950/40 border border-slate-900/60 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed text-center italic font-sans max-w-3xl">
                  {isAnsweringQuestion 
                    ? `[Answering Question]: "${teacherAnsweringText}"`
                    : `"${activeSegment.lectureText}"`
                  }
                </p>
              </div>

            </div>
          ) : (
            <div className="m-auto text-center select-none z-10">
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500 mx-auto mb-4 animate-float">
                <Sparkles size={28} />
              </div>
              <h3 className="text-lg font-bold font-display">Awaiting classroom synchronization</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                The AI teacher is setting up and will start the lecture shortly.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Persistent Panel combining Participant Tiles and AI Student Doubt Chat */}
        <div className="w-80 bg-slate-950 border-l border-slate-900/60 flex flex-col shrink-0 select-none">
          
          {/* Top Section: Class Participants List */}
          <div className="p-4 border-b border-slate-900/60 flex flex-col min-h-0 flex-none bg-[#090A10]/40">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono border-b border-slate-900/80 pb-2 mb-3">
              Class Participants ({3 + (preJoined ? 1 : 0)})
            </div>
            
            {/* Grid of participant tiles */}
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[180px] pr-1 animate-fade-in">
              
              {/* 1. AI Teacher Tile */}
              <div className={`aspect-video rounded-lg bg-slate-900 overflow-hidden relative border transition-all duration-300 flex flex-col items-center justify-center shadow ${
                aiIsSpeaking ? 'border-accent-500 bg-slate-900/30' : 'border-slate-800'
              }`}>
                <div className="relative w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br from-accent-600 to-cyber-purple transition-opacity ${
                    aiIsSpeaking ? 'opacity-85' : 'opacity-20'
                  }`} />
                  <Sparkles size={14} className={`relative z-10 text-white ${aiIsSpeaking ? 'animate-pulse' : 'opacity-50'}`} />
                </div>
                {aiIsSpeaking && (
                  <div className="flex gap-0.5 items-end justify-center h-2 mt-1">
                    <div className="w-0.5 rounded bg-accent-500 h-1 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.1s' }} />
                    <div className="w-0.5 rounded bg-accent-500 h-2.5 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.3s' }} />
                    <div className="w-0.5 rounded bg-accent-500 h-2 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}
                <div className="absolute bottom-1 left-1.5 bg-slate-950/80 border border-slate-850 px-1 py-0.2 rounded text-[8px] font-semibold text-white tracking-wide">
                  Professor AI (Host)
                </div>
              </div>

              {/* 2. User camera Tile */}
              <div className="aspect-video rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center shadow">
                {cameraOn && localStream ? (
                  <video
                    ref={userVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs select-none">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-1 left-1.5 bg-slate-950/80 border border-slate-850 px-1 py-0.2 rounded text-[8px] font-semibold text-white tracking-wide truncate max-w-[65px]">
                  {displayName} (You)
                </div>
                <div className={`absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white ${
                  micOn ? 'bg-cyber-green/15 text-cyber-green' : 'bg-error/20 text-error'
                }`}>
                  {micOn ? <Mic size={7} /> : <MicOff size={7} />}
                </div>
              </div>

              {/* 3. Mock Student 1: Priya */}
              <div className="aspect-video rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center shadow group">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyber-purple/20 to-cyber-pink/20 border border-slate-800 flex items-center justify-center font-bold text-cyber-pink text-xs select-none">
                  PS
                </div>
                <div className="absolute bottom-1 left-1.5 bg-slate-950/80 border border-slate-850 px-1 py-0.2 rounded text-[8px] font-semibold text-white tracking-wide">
                  Priya Sharma
                </div>
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-cyber-green/15 text-cyber-green">
                  <Mic size={7} />
                </div>
              </div>

              {/* 4. Mock Student 2: Alex */}
              <div className="aspect-video rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center shadow">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyber-green/20 to-accent-500/20 border border-slate-800 flex items-center justify-center font-bold text-cyber-green text-xs select-none">
                  AC
                </div>
                <div className="absolute bottom-1 left-1.5 bg-slate-950/80 border border-slate-850 px-1 py-0.2 rounded text-[8px] font-semibold text-white tracking-wide">
                  Alex Chen
                </div>
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-cyber-green/15 text-cyber-green">
                  <Mic size={7} />
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Section: AI Student Doubt Chat Panel */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#0C0F19]">
            {/* Header */}
            <div className="p-3 border-b border-slate-900/60 bg-slate-950 flex items-center gap-2 select-none">
              <MessageSquare size={14} className="text-accent-500" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">Doubt Chat</span>
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse ml-auto" />
              <span className="text-[9px] text-slate-500 font-mono">AI Teacher Active</span>
            </div>

            {/* Chat message area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              {chatMessages.map((msg, idx) => {
                return (
                  <div
                    key={idx}
                    className={`flex flex-col text-left max-w-[85%] ${
                      msg.isSelf ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <span className="text-[9px] text-slate-500 font-bold mb-1 font-mono uppercase tracking-wider">
                      {msg.sender} • {msg.time}
                    </span>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed font-sans shadow-md ${
                        msg.isSelf
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* WhatsApp-style Input box */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-900/80 bg-slate-950 flex gap-2 select-none">
              <input
                ref={chatInputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a doubt..."
                disabled={isAnsweringQuestion}
                className="flex-1 text-xs py-2.5 px-3.5 rounded-xl border border-slate-800 bg-slate-900 placeholder:text-slate-500 text-slate-200 outline-none focus:border-blue-600 disabled:opacity-50 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={isAnsweringQuestion}
                className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 border-none cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50 transition-all shadow shadow-blue-600/20"
              >
                <Send size={15} />
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* Bottom Meeting Toolbar controls */}
      <div className="h-20 bg-slate-950/95 border-t border-slate-900/65 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none relative z-30">
        
        {/* Left Toolbar: Narration Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMuted(prev => !prev)}
            className={`p-2.5 rounded-xl border-none cursor-pointer transition-all ${
              isMuted ? 'bg-error/15 text-error' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title={isMuted ? "Unmute Lecture Voice" : "Mute Lecture Voice"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              disabled={isMuted}
              className="w-20 accent-accent-500 h-1 rounded-full cursor-pointer bg-slate-800 border-none outline-none disabled:opacity-40"
            />
          </div>
        </div>

        {/* Center Toolbar: Webcam / Audio Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMicOn(prev => !prev)}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all border-none cursor-pointer ${
              micOn 
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-850' 
                : 'bg-error text-white hover:bg-error/95 shadow-md shadow-error/15'
            }`}
          >
            {micOn ? <Mic size={16} /> : <MicOff size={16} />}
            <span className="text-[9px] font-semibold uppercase font-mono tracking-wider">Mute</span>
          </button>

          <button
            type="button"
            onClick={() => setCameraOn(prev => !prev)}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all border-none cursor-pointer ${
              cameraOn 
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-850' 
                : 'bg-error text-white hover:bg-error/95 shadow-md shadow-error/15'
            }`}
          >
            {cameraOn ? <Video size={16} /> : <VideoOff size={16} />}
            <span className="text-[9px] font-semibold uppercase font-mono tracking-wider">Video</span>
          </button>

          <button
            type="button"
            onClick={handleLeaveClass}
            className="flex flex-col items-center gap-1 py-1.5 px-4.5 rounded-xl bg-error/90 hover:bg-error text-white border-none cursor-pointer hover:shadow-lg hover:shadow-error/15 active:scale-95 transition-all"
          >
            <PhoneOff size={16} />
            <span className="text-[9px] font-bold uppercase font-mono tracking-wider">Leave</span>
          </button>
        </div>

        {/* Right Toolbar: Drawer Toggles */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const pGrid = document.querySelector('.grid-cols-2');
              pGrid?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }}
            className="flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl border-none cursor-pointer bg-slate-900 text-slate-300 hover:bg-slate-850 transition-all"
          >
            <Users size={16} />
            <span className="text-[9px] font-semibold uppercase font-mono tracking-wider">People</span>
          </button>

          <button
            type="button"
            onClick={() => {
              chatInputRef.current?.focus();
            }}
            className="flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl border-none cursor-pointer bg-slate-900 text-slate-300 hover:bg-slate-850 transition-all"
          >
            <MessageSquare size={16} />
            <span className="text-[9px] font-semibold uppercase font-mono tracking-wider">Chat</span>
          </button>
        </div>

      </div>

    </div>
  );
}
