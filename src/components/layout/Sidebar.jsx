import {
  Home, Clock, Dumbbell, DollarSign, Settings, LogOut,
  ClipboardList, TrendingUp, Users
} from 'lucide-react';

export const Sidebar = ({ activeView, onViewChange, onLogout, userRole }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'schedule', icon: Clock, label: 'Horario' },
    // Admin Only
    ...(userRole === 'admin' ? [
      { id: 'builder', icon: Dumbbell, label: 'Builder' },
      { id: 'clients', icon: Users, label: 'Clients' },
      { id: 'finance', icon: DollarSign, label: 'Pagos' }
    ] : []),
    // Client Only
    ...(userRole === 'client' ? [
      { id: 'my_routine', icon: ClipboardList, label: 'My Orders' },
      { id: 'progress', icon: TrendingUp, label: 'Progress' }
    ] : []),
    // Everyone
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="w-20 lg:w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col items-center lg:items-stretch py-8 relative z-[60]">
      <div className="px-6 mb-12 text-center lg:text-left">
        <h1 className="font-bebas text-4xl tracking-tighter text-white">M<span className="text-neutral-500">.</span>FIT</h1>
        {userRole === 'admin' && <span className="hidden lg:block font-mono-tech text-[9px] text-emerald-500 uppercase tracking-widest mt-2">COMMANDER ACCESS</span>}
        {userRole === 'client' && <span className="hidden lg:block font-mono-tech text-[9px] text-blue-500 uppercase tracking-widest mt-2">OPERATIVE ACCESS</span>}
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 transition-all group relative ${activeView === item.id
                ? 'bg-white/5 text-white border-r-2 border-white'
                : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
          >
            <item.icon size={20} className={activeView === item.id ? 'animate-pulse' : ''} />
            <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.2em]">
              {item.label}
            </span>
            {activeView === item.id && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-4 text-neutral-600 hover:text-red-500 transition-all group"
        >
          <LogOut size={20} />
          <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.2em]">
            Log Out
          </span>
        </button>
      </div>
    </div>
  );
};
