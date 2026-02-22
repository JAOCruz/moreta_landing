import { useState, useEffect } from 'react';
import { User, Lock, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Styles } from '../ui/Styles';

export const LoginScreen = ({ onLogin, onSignup, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignupMode) onSignup(email, password);
    else onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-inter px-4">
      <Styles />

      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <form
        onSubmit={handleSubmit}
        className="z-10 w-full max-w-md p-8 sm:p-10 glass-panel border border-neutral-800"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="mb-10 text-center">
          <h1 className="font-bebas text-6xl sm:text-7xl mb-2 tracking-tighter">
            MORETA<span className="text-emerald-500">.</span>FIT
          </h1>
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto mb-3"></div>
          <p className="font-mono-tech text-[9px] text-neutral-500 tracking-[0.3em] uppercase">
            {isSignupMode ? 'Client Registration' : 'Tactical Dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono-tech flex items-center gap-3">
            <AlertTriangle size={14} />
            {error.message}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-[9px] font-bold text-neutral-500 mb-2 uppercase tracking-[0.2em]">Client Identifier</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-emerald-500/30 focus-within:shadow-[0_0_0_1px_rgba(52,211,153,0.1)]">
              <User size={16} className="text-neutral-600 mr-3" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="user@moreta.fit"
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-neutral-500 mb-2 uppercase tracking-[0.2em]">Access Key</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-emerald-500/30 focus-within:shadow-[0_0_0_1px_rgba(52,211,153,0.1)]">
              <Lock size={16} className="text-neutral-600 mr-3" />
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800"
              />
            </div>
            {isSignupMode && (
              <p className="text-[9px] text-neutral-600 font-mono-tech mt-2 ml-1">* Minimum 6 characters required</p>
            )}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-white text-black font-bold font-mono-tech py-4 sm:py-5 text-xs uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 transition-all flex justify-center items-center gap-3 group btn-press"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {isSignupMode ? 'Create Account' : 'Access System'}
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => { setIsSignupMode(!isSignupMode); setEmail(''); setPassword(''); }}
              className="text-neutral-500 hover:text-emerald-400 text-xs font-mono-tech uppercase tracking-widest transition-colors"
            >
              {isSignupMode ? '← Back to Login' : 'New Client? Register Here →'}
            </button>
          </div>
        </div>
      </form>

      <div className="absolute bottom-6 sm:bottom-8 flex gap-6 text-[8px] text-neutral-700 font-mono-tech uppercase tracking-[0.2em]">
        <span className="flex items-center gap-1.5"><span className="status-dot live" style={{width:4,height:4}}></span>System Online</span>
        <span>v6.0.0</span>
      </div>
    </div>
  );
};
