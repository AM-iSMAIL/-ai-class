import { useState } from 'react';
import {
  Zap,
  BookOpen,
  Clock,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Eye,
  Share2,
  GraduationCap,
  Mail,
  MessageSquare,
  Send,
  X,
  AlertTriangle,
} from 'lucide-react';
import { db, toggleForceLocalMode, runWithTimeout } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function TeacherSetup({ onNext, onClassData }) {
  const [title, setTitle] = useState('');
  const [topics, setTopics] = useState(['', '', '', '', '', '']);
  const [duration, setDuration] = useState(10);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopicChange = (index, value) => {
    setTopics((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    const code = generateCode();
    setSessionCode(code);

    const sessionData = {
      sessionCode: code,
      title: title.trim(),
      topics: topics.map((t) => t.trim()),
      duration,
    };

    if (db) {
      try {
        await runWithTimeout(
          setDoc(doc(db, "sessions", code), {
            ...sessionData,
            status: 'waiting',
            currentTopicIndex: 0,
            createdAt: new Date()
          })
        );
        onClassData(sessionData);
        setSessionCreated(true);
      } catch (err) {
        console.error("Firestore session creation failed:", err);
        let errorMsg = err.message || String(err);
        if (errorMsg.includes("permission-denied") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("Cloud Firestore API")) {
          errorMsg = "Cloud Firestore API has not been enabled for Firebase project 'future-studies-f1753', or security rules block this write. Please enable the API and setup the database, or switch to Local Sandbox mode.";
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    } else {
      onClassData(sessionData);
      setSessionCreated(true);
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareClick = async () => {
    const joinLink = `${window.location.origin}${window.location.pathname}?session=${sessionCode}`;
    const shareText = `Join my live AI-powered class session "${title}"!\nCode: ${sessionCode}\nLink: ${joinLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `ClassAI — ${title}`,
          text: `Join my live class session "${title}"!`,
          url: joinLink
        });
        return;
      } catch (err) {
        console.log("Web Share API cancelled or not supported, falling back to modal:", err);
      }
    }
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const joinLink = `${window.location.origin}${window.location.pathname}?session=${sessionCode}`;
    navigator.clipboard.writeText(joinLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isValid =
    title.trim().length > 0 &&
    topics.every((t) => t.trim().length > 0);

  // ─── Post-creation: show session code ───────────────────
  if (sessionCreated) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
          <div className="orb orb-green w-80 h-80 -top-24 -right-16" />
          <div className="orb orb-purple w-72 h-72 -bottom-20 -left-12" />

          <div className="w-full max-w-lg relative z-10">
            {/* Header */}
            <div className="text-center mb-8 animate-slide-up">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-gradient-to-br from-cyber-green/20 to-accent-500/20 border border-cyber-green/20">
                <Check size={30} className="text-cyber-green" />
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Session{' '}
                <span className="bg-gradient-to-r from-cyber-green to-accent-500 bg-clip-text text-transparent">
                  Created!
                </span>
              </h1>
              <p className="text-slate-500">
                Share the code below with your students
              </p>
            </div>

            {/* Session Code Card */}
            <div className="glass p-8 text-center mb-6 animate-slide-up gradient-border">
              <p className="text-xs font-semibold text-accent-600 uppercase tracking-widest mb-4">
                Session Code
              </p>
              <div
                className="text-5xl sm:text-6xl font-bold tracking-[0.35em] text-accent-600 mb-5 glow-text"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {sessionCode}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer border-none bg-accent-500/10 text-accent-600 hover:bg-accent-500/20"
              >
                {copied ? (
                  <>
                    <Check size={15} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Session Summary */}
            <div className="glass-light p-5 mb-6 animate-slide-up border border-slate-200/80">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                <Sparkles size={14} className="text-accent-500" />
                Session Details
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Title</span>
                  <span className="text-slate-800 font-medium">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Topics</span>
                  <span className="text-slate-800 font-medium">6 topics</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration per topic</span>
                  <span className="text-slate-800 font-medium">{duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total duration</span>
                  <span className="text-accent-600 font-bold">{duration * 6} min</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 animate-slide-up">
              <button
                type="button"
                onClick={onNext}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <Eye size={18} />
                View as Teacher
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={handleShareClick}
                className="btn-secondary w-full flex items-center justify-center gap-2.5 text-base cursor-pointer"
              >
                <Share2 size={17} />
                <span>
                  Share Join Link:{' '}
                  <span className="font-mono font-bold text-accent-600 tracking-wider">
                    {sessionCode}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Share Modal Dialog overlay */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-fade-in px-4">
            <div className="glass p-6 max-w-sm w-full relative z-10 animate-slide-up border border-slate-200/80 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-550 hover:text-slate-800 border-none cursor-pointer transition-all duration-200"
              >
                <X size={15} />
              </button>

              <h2 className="text-xl font-bold text-slate-850 mb-1.5 font-display flex items-center gap-2">
                <Share2 size={18} className="text-accent-500" />
                Invite Students
              </h2>
              <p className="text-slate-550 text-xs leading-relaxed mb-6">
                Select an option below to share the interactive session link with your class.
              </p>

              <div className="space-y-3">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join my live class "${title}"!\nCode: ${sessionCode}\nLink: ${window.location.origin}${window.location.pathname}?session=${sessionCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left p-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 border border-transparent glass-light hover:border-cyber-green/30 hover:bg-cyber-green/5 text-slate-700 hover:text-slate-800 cursor-pointer no-underline"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyber-green/10 flex items-center justify-center text-cyber-green shrink-0">
                    <MessageSquare size={16} className="fill-cyber-green/10" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Share on WhatsApp</span>
                    <span className="text-[10px] text-slate-500">Send directly to your student groups</span>
                  </div>
                </a>

                <a
                  href={`mailto:?subject=${encodeURIComponent(`Join ClassAI Session: ${title}`)}&body=${encodeURIComponent(`Join my live class "${title}"!\n\nSession Code: ${sessionCode}\nLink: ${window.location.origin}${window.location.pathname}?session=${sessionCode}`)}`}
                  className="w-full text-left p-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 border border-transparent glass-light hover:border-accent-500/30 hover:bg-accent-500/5 text-slate-700 hover:text-slate-800 cursor-pointer no-underline"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-500 shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Email Invitation</span>
                    <span className="text-[10px] text-slate-500">Share via Gmail, Outlook, or mail client</span>
                  </div>
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?session=${sessionCode}`)}&text=${encodeURIComponent(`Join my live class session "${title}"! (Code: ${sessionCode})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left p-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 border border-transparent glass-light hover:border-cyber-purple/30 hover:bg-cyber-purple/5 text-slate-700 hover:text-slate-800 cursor-pointer no-underline"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyber-purple/10 flex items-center justify-center text-cyber-purple shrink-0">
                    <Send size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Share on Telegram</span>
                    <span className="text-[10px] text-slate-500">Send to channels or classroom chats</span>
                  </div>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full text-left p-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 border border-transparent glass-light hover:border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer flex"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-650 shrink-0">
                    {copiedLink ? <Check size={16} className="text-cyber-green" /> : <Copy size={16} />}
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">
                      {copiedLink ? 'Copied!' : 'Copy Session Link'}
                    </span>
                    <span className="text-[10px] text-slate-500">Copy URL with embedded room code</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── Creation form ──────────────────────────────────────
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
      {/* Decorative orbs */}
      <div className="orb orb-blue w-72 h-72 -top-20 -left-20" />
      <div className="orb orb-purple w-96 h-96 -bottom-32 -right-20" />

      <div className="w-full max-w-lg relative z-10 stagger">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-600 text-xs font-medium mb-5">
            <Sparkles size={14} />
            <span>AI-Powered Classroom</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Create Your{' '}
            <span className="bg-gradient-to-r from-accent-600 via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
              Session
            </span>
          </h1>
          <p className="text-slate-600 text-base">
            Set up your topics and invite students to join
          </p>
        </div>

        {/* Form Card */}
        <div className="glass p-6 sm:p-8 animate-slide-up border border-slate-200/80 shadow-xl">
          <div className="space-y-6">
            {/* Quick Demo Preload */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setTitle("Introduction to Machine Learning");
                  setTopics([
                    "Neural Networks",
                    "Supervised Learning",
                    "Unsupervised Learning",
                    "Decision Trees",
                    "Overfitting",
                    "Model Evaluation"
                  ]);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-accent-500/10 border border-accent-500/20 hover:bg-accent-500/15 text-accent-600 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={13} className="text-accent-500" />
                Load Demo
              </button>
            </div>

            {/* Session Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2 font-display">
                <GraduationCap size={15} className="text-accent-500" />
                Session Title
              </label>
              <input
                type="text"
                className="input-dark"
                placeholder="e.g. AP Physics — Forces & Motion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* 6 Topic Inputs */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3 font-display">
                <BookOpen size={15} className="text-cyber-purple" />
                Topics (6 required)
              </label>
              <div className="space-y-2.5">
                {topics.map((topic, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-navy-800 border border-slate-200 text-slate-500 shrink-0 select-none">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      className="input-dark"
                      placeholder={`Topic ${idx + 1}`}
                      value={topic}
                      onChange={(e) => handleTopicChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Duration per topic */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Clock size={14} className="text-cyber-green" />
                Duration per Topic (minutes)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-accent-200
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-accent-500
                    [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,118,255,0.3)]
                    [&::-webkit-slider-thumb]:cursor-pointer
                  "
                />
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-50 border border-accent-100 min-w-[72px] justify-center">
                  <span className="text-slate-800 font-bold font-mono text-sm">
                    {duration}
                  </span>
                  <span className="text-slate-600 text-xs">min</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Total session time:{' '}
                <span className="text-accent-600 font-semibold">
                  {duration * 6} minutes
                </span>
              </p>
            </div>
            {/* Error Message */}
            {error && (
              <div className="flex flex-col gap-3 text-error text-sm bg-error/10 px-4 py-3.5 rounded-lg border border-error/20 text-left">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <a
                    href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=future-studies-f1753"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-error/20 hover:bg-error/30 text-white text-xs font-semibold no-underline inline-block border border-error/30"
                  >
                    Enable API on GCP
                  </a>
                  <a
                    href="https://console.firebase.google.com/project/future-studies-f1753/firestore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-error/20 hover:bg-error/30 text-white text-xs font-semibold no-underline inline-block border border-error/30"
                  >
                    Set Up DB on Firebase
                  </a>
                  <button
                    type="button"
                    onClick={toggleForceLocalMode}
                    className="px-2.5 py-1 rounded bg-warning/20 hover:bg-warning/30 text-warning text-xs font-bold border border-warning/30 cursor-pointer"
                  >
                    Switch to Local Sandbox Mode
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleCreate}
            disabled={!isValid || loading}
            className={`
              btn-primary w-full mt-8 flex items-center justify-center gap-2
              text-base cursor-pointer
              ${!isValid || loading ? 'opacity-40 cursor-not-allowed !transform-none' : ''}
            `}
          >
            <Zap size={18} />
            <span>{loading ? 'Creating...' : 'Create Session'}</span>
          </button>

          {/* Validation hint */}
          {!isValid && (title.length > 0 || topics.some((t) => t.length > 0)) && (
            <p className="text-xs text-slate-600 text-center mt-3">
              Fill in the session title and all 6 topics to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
