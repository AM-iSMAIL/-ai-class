import { Sparkles, GraduationCap, Users, LogIn, LogOut, ArrowRight } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Home({ user, onLogin, onLogout, onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Decorative orbs */}
      <div className="orb orb-blue w-96 h-96 -top-24 -left-20" />
      <div className="orb orb-purple w-96 h-96 -bottom-24 -right-20" />

      <div className="w-full max-w-4xl relative z-10 text-center stagger">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-600 text-xs font-medium mb-6 animate-slide-up select-none">
          <Sparkles size={14} className="text-accent-500" />
          <span>Next-Gen Interactive Learning</span>
        </div>

        {/* Hero Headlines */}
        <h1 
          className="text-4xl sm:text-6xl font-extrabold text-slate-800 mb-4 tracking-tight leading-none animate-slide-up"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Welcome to <span className="bg-gradient-to-r from-accent-600 via-cyber-purple to-cyber-pink bg-clip-text text-transparent">ClassAI</span>
        </h1>
        <p className="text-slate-600 text-lg sm:text-xl max-w-xl mx-auto mb-12 animate-slide-up">
          Experience real-time interactive lectures powered by AI, immediate quiz feedback, and gamified engagement.
        </p>

        {/* Portals Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          
          {/* Teacher Portal Card */}
          <div className="glass p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between border border-slate-200 hover:border-accent-500/40 shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 rounded-full filter blur-xl transition-all duration-500 group-hover:bg-accent-500/10" />
            
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent-500/20 to-cyber-purple/20 border border-accent-500/20 mb-6">
                <GraduationCap size={24} className="text-accent-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-3 font-display">Teacher Portal</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Configure your topics, host live AI-assisted classroom sessions, invite your students, and view real-time score statistics.
              </p>
            </div>

            <div className="mt-4 pt-6 border-t border-slate-100">
              {user ? (
                <div className="space-y-4">
                  {/* Active User profile details */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-900/5 border border-navy-700/10 text-slate-600">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center font-bold text-accent-500">
                        {user.displayName?.charAt(0) || 'T'}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('teacher-setup')}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                    >
                      <span>Create Session</span>
                      <ArrowRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-3 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-center"
                      title="Sign Out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-bold bg-white text-slate-800 border border-slate-200 hover:scale-[1.02] shadow-sm cursor-pointer transition-all duration-300"
                  style={{ background: '#ffffff', color: '#1a1a2a' }}
                >
                  <GoogleIcon />
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Student Portal Card */}
          <div className="glass p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between border border-slate-200 hover:border-cyber-green/40 shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-green/5 rounded-full filter blur-xl transition-all duration-500 group-hover:bg-cyber-green/10" />
            
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyber-green/20 to-accent-500/20 border border-cyber-green/20 mb-6">
                <Users size={24} className="text-cyber-green" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-3 font-display">Student Portal</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Enter an active classroom session. Participate in live lectures, answer quiz questions, and climb the scoreboard.
              </p>
            </div>

            <div className="mt-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('student-join')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-cyber-green/10 to-accent-500/10 border border-cyber-green/30 hover:border-cyber-green/50 text-cyber-green hover:scale-[1.02] shadow-sm cursor-pointer transition-all duration-300"
              >
                <span>Join Classroom Session</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

