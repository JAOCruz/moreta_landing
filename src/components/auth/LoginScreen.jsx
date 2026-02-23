import { useState, useEffect, useRef } from 'react';
import { User, Lock, ChevronRight, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';
import { Styles } from '../ui/Styles';

export const LoginScreen = ({ onLogin, onSignup, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);
  const particlesRef = useRef(null);
  const errorRef = useRef(null);

  // Entrance animation
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
      );
      // Stagger form children
      const children = formRef.current.querySelectorAll('.form-child');
      gsap.fromTo(children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.5 }
      );
    }
  }, []);

  // Error shake animation
  useEffect(() => {
    if (error && formRef.current) {
      gsap.fromTo(formRef.current,
        { x: -6 },
        { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }
      );
    }
  }, [error]);

  // Floating particles
  useEffect(() => {
    if (!particlesRef.current) return;
    const canvas = particlesRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.3 + 0.05
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.o})`;
        ctx.fill();
      });
      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignupMode) onSignup(email, password);
    else onLogin(email, password);
  };

  return (
    <div className="min-h-screen animated-gradient-bg text-white flex flex-col items-center justify-center relative overflow-hidden font-inter px-4">
      <Styles />

      {/* Particle background */}
      <canvas ref={particlesRef} className="particle-bg" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="z-10 w-full max-w-md p-8 sm:p-10 glass-panel border border-neutral-800 opacity-0"
      >
        {/* Logo */}
        <div className="mb-10 text-center form-child">
          <h1 className="font-bebas text-6xl sm:text-7xl mb-2 tracking-tighter">
            MORETA<span className="text-emerald-500">.</span>FIT
          </h1>
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto mb-3" />
          <p className="font-mono-tech text-[9px] text-neutral-500 tracking-[0.3em] uppercase">
            {isSignupMode ? 'Client Registration' : 'Tactical Dashboard'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div ref={errorRef} className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-tech flex items-center gap-3 form-child"
            style={{ boxShadow: '0 0 20px -5px rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={14} />
            <span>{error.message}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Email — floating label */}
          <div className="form-child">
            <label className="block text-[9px] font-bold text-neutral-500 mb-2 uppercase tracking-[0.2em]">Client Identifier</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-emerald-500/40 focus-within:shadow-[0_0_20px_-5px_rgba(52,211,153,0.15)] group">
              <User size={16} className="text-neutral-600 mr-3 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="user@moreta.fit"
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-child">
            <label className="block text-[9px] font-bold text-neutral-500 mb-2 uppercase tracking-[0.2em]">Access Key</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-emerald-500/40 focus-within:shadow-[0_0_20px_-5px_rgba(52,211,153,0.15)] group">
              <Lock size={16} className="text-neutral-600 mr-3 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-neutral-600 hover:text-white transition-colors ml-2">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {isSignupMode && (
              <p className="text-[9px] text-neutral-600 font-mono-tech mt-2 ml-1">* Minimum 6 characters required</p>
            )}
          </div>

          {/* Submit */}
          <div className="form-child">
            <button
              type="submit" disabled={loading}
              className="w-full bg-white text-black font-bold font-mono-tech py-4 sm:py-5 text-xs uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 transition-all flex justify-center items-center gap-3 group btn-press relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 h-[2px] bg-emerald-500" style={{
                    animation: 'preloaderProgress 2s ease infinite',
                    width: '0%'
                  }} />
                </div>
              ) : (
                <>
                  {isSignupMode ? 'Create Account' : 'Access System'}
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Toggle */}
          <div className="text-center pt-4 border-t border-neutral-800 form-child">
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

      {/* Status bar */}
      <div className="absolute bottom-6 sm:bottom-8 flex gap-6 text-[8px] text-neutral-700 font-mono-tech uppercase tracking-[0.2em] z-10">
        <span className="flex items-center gap-1.5"><span className="status-dot live" style={{width:4,height:4}} /><span>System Online</span></span>
        <span>v7.0.0</span>
      </div>
    </div>
  );
};
