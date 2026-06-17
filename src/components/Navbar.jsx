import {
  Zap,
  GraduationCap,
  BookOpen,
  Trophy,
  BarChart3,
  Users,
  LogOut,
  LogIn,
} from 'lucide-react';

const SCREENS = [
  { id: 'teacher-setup', label: 'Setup', icon: Zap },
  { id: 'student-join', label: 'Join', icon: Users },
  { id: 'waiting-room', label: 'Waiting', icon: BookOpen },
  { id: 'classroom', label: 'Class', icon: GraduationCap },
  { id: 'quiz', label: 'Quiz', icon: Trophy },
  { id: 'results', label: 'Results', icon: BarChart3 },
];

const SCREEN_LABELS = {
  'home': 'Home',
  'teacher-setup': 'Teacher Setup',
  'student-join': 'Student Join',
  'waiting-room': 'Waiting Room',
  'classroom': 'AI Classroom',
  'quiz': 'Interactive Quiz',
  'results': 'Session Results'
};

export default function Navbar({
  currentScreen,
  onNavigate,
  studentInfo,
  strikeCount,
  classData,
  user,
  onLogout,
  onLogin,
}) {
  const currentIndex = SCREENS.findIndex((s) => s.id === currentScreen);
  const CurrentIcon = SCREENS[currentIndex]?.icon || Zap;
  const currentLabel = SCREENS[currentIndex]?.label || 'Setup';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-navy-700/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Screen Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none text-left p-0"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-accent-500 to-cyber-purple glow-accent">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-800 font-display">
                ClassAI
              </span>
            </button>
            {currentScreen !== 'home' && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-navy-900/5 border border-navy-700/10 text-slate-600 uppercase tracking-wider font-mono select-none">
                  {SCREEN_LABELS[currentScreen] || currentScreen}
                </span>
              </>
            )}
          </div>

          {/* Right Section: Session Code, Student Status, and Step Indicator */}
          <div className="flex items-center gap-4">
            {/* Active Session Code */}
            {classData?.sessionCode && currentScreen !== 'home' && (
              <div className="flex items-center gap-1.5 bg-accent-500/10 border border-accent-500/20 px-3 py-1.5 rounded-lg text-xs font-bold text-accent-600 font-mono tracking-wider select-all">
                <span className="text-slate-400 text-[10px] uppercase font-sans font-normal hidden sm:inline">Code:</span>
                {classData.sessionCode}
              </div>
            )}

            {/* Student Status Badge */}
            {studentInfo && currentScreen !== 'home' && (
              <div className="hidden sm:flex items-center gap-2.5 bg-navy-900/5 border border-navy-700/10 px-3.5 py-1.5 rounded-full shadow-inner animate-fade-in select-none">
                {studentInfo.photoURL ? (
                  <img 
                    src={studentInfo.photoURL} 
                    alt={studentInfo.fullName} 
                    className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
                )}
                <span className="text-[11px] font-semibold text-slate-600 font-display">
                  {studentInfo.fullName}
                </span>
                <span className="text-[10px] text-slate-300 font-mono">|</span>
                <span className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded ${
                  strikeCount > 0 
                    ? 'bg-error/15 text-error border border-error/20 animate-pulse' 
                    : 'bg-accent-500/10 text-accent-600 border border-accent-500/20'
                }`}>
                  Strikes: {strikeCount}
                </span>
              </div>
            )}

            {/* Step Indicator vs Authentication Controls */}
            {currentScreen === 'home' ? (
              user ? (
                <div className="flex items-center gap-3 bg-navy-900/5 border border-navy-700/10 px-3 py-1.5 rounded-xl shadow-inner animate-fade-in select-none">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center font-bold text-accent-500 text-xs">
                      {user.displayName?.charAt(0) || 'T'}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-600 font-display hidden sm:inline">
                    {user.displayName}
                  </span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer hover:bg-black/5 transition-all"
                    title="Sign Out"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-accent-500 text-white hover:bg-accent-600 transition-all cursor-pointer border-none shadow-sm"
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
              )
            ) : (
              /* Dynamic Step indicator matching screenshot */
              <div className="flex items-center gap-1.5 text-sm font-semibold text-accent-600 font-display select-none">
                <CurrentIcon size={16} className="text-accent-500" />
                <span className="font-semibold text-accent-500">
                  {currentLabel}
                </span>
                <span className="text-slate-400 font-normal">
                  ({currentIndex + 1}/{SCREENS.length})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {currentScreen !== 'home' && (
        <div className="h-0.5 bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-accent-500 to-cyber-purple transition-all duration-700 ease-out progress-bar-glow"
            style={{
              width: `${((currentIndex + 1) / SCREENS.length) * 100}%`,
            }}
          />
        </div>
      )}
    </nav>
  );
}
