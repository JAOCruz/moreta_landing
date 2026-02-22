export const Header = ({ user, userRole }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 lg:mb-12 border-b border-white/5 pb-4 sm:pb-6 lg:pb-8 gap-2">
      <div>
        <p className="font-mono-tech text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-[0.4em] mb-1 sm:mb-2">
          SYSTEM STATUS: <span className="text-emerald-500 animate-pulse">ACTIVE</span>
        </p>
        <h1 className="font-bebas text-2xl sm:text-3xl lg:text-5xl tracking-widest text-shadow-glow">
          <span className="sm:hidden">M<span className="text-emerald-500">.</span>FIT</span>
          <span className="hidden sm:inline">OPERATIONAL HUD</span>
        </h1>
      </div>
      <div className="flex flex-col items-start sm:items-end">
        <span className="font-mono-tech text-[10px] sm:text-xs text-neutral-300 truncate max-w-[200px] sm:max-w-none">
          USER: {user?.email}
        </span>
        <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5 sm:mt-1">
          ROLE: {userRole?.toUpperCase()}
        </span>
      </div>
    </header>
  );
};
