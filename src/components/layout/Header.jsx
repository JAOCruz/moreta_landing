export const Header = ({ user, userRole }) => {
  return (
    <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
      <div>
        <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-[0.4em] mb-2">
          SYSTEM STATUS: <span className="text-emerald-500 animate-pulse">ACTIVE</span>
        </p>
        <h1 className="font-bebas text-5xl tracking-widest text-shadow-glow">OPERATIONAL HUD</h1>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-mono-tech text-xs text-neutral-300">USER: {user?.email}</span>
        <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mt-1">
          ROLE: {userRole?.toUpperCase()}
        </span>
      </div>
    </header>
  );
};
