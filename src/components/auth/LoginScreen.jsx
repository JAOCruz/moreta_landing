import { useState } from 'react';
import { User, Lock, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Styles } from '../ui/Styles';

export const LoginScreen = ({ onLogin, onSignup, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignupMode) {
      onSignup(email, password);
    } else {
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-inter">
      <Styles />
      <div className="absolute inset-0 opacity-20"></div>

      <form onSubmit={handleSubmit} className="z-10 w-full max-w-md p-10 glass-panel border border-neutral-800 animate-in fade-in zoom-in duration-500">
        <div className="mb-10 text-center">
          <h1 className="font-bebas text-7xl mb-2 tracking-tighter">MORETA FITNESS</h1>
          <p className="font-mono-tech text-[10px] text-neutral-500 tracking-[0.3em] uppercase">
            {isSignupMode ? 'Client Registration' : 'Tactical Dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono-tech flex items-center gap-3">
            <AlertTriangle size={14} />
            {error.message}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Client Identifier</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-white/20">
              <User size={16} className="text-neutral-500 mr-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@moreta.fit"
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Access Key</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-white/20">
              <Lock size={16} className="text-neutral-500 mr-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800"
              />
            </div>
            {isSignupMode && (
              <p className="text-[9px] text-neutral-600 font-mono-tech mt-2 ml-1">
                * Minimum 6 characters required
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold font-mono-tech py-5 text-xs uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50 transition-all flex justify-center items-center gap-3 group"
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

          {/* Toggle between Login/Signup */}
          <div className="text-center pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setIsSignupMode(!isSignupMode);
                setEmail('');
                setPassword('');
              }}
              className="text-neutral-500 hover:text-white text-xs font-mono-tech uppercase tracking-widest transition-colors"
            >
              {isSignupMode ? '← Back to Login' : 'New Client? Register Here →'}
            </button>
          </div>
        </div>
      </form>

      <div className="absolute bottom-8 flex gap-8 text-[9px] text-neutral-600 font-mono-tech uppercase tracking-widest">
        <span>System Status: Online</span>
        <span>Version: 5.3.0-FINAL-STABLE</span>
      </div>
    </div>
  );
};
