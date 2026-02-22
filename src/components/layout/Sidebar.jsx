import {
  Home, Clock, Dumbbell, DollarSign, Settings, LogOut,
  ClipboardList, TrendingUp, Users, Sliders
} from 'lucide-react';

export const Sidebar = ({ activeView, onViewChange, onLogout, userRole }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'schedule', icon: Clock, label: 'Horario' },
    ...(userRole === 'admin' ? [
      { id: 'builder', icon: Dumbbell, label: 'Builder' },
      { id: 'clients', icon: Users, label: 'Clients' },
      { id: 'finance', icon: DollarSign, label: 'Finance' },
      { id: 'admin_settings', icon: Sliders, label: 'Business' }
    ] : []),
    ...(userRole === 'client' ? [
      { id: 'my_routine', icon: ClipboardList, label: 'My Orders' },
      { id: 'progress', icon: TrendingUp, label: 'Progress' }
    ] : []),
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="w-16 sm:w-20 lg:w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col items-center lg:items-stretch py-6 sm:py-8 relative z-[60]">
      <div className="px-3 lg:px-6 mb-8 lg:mb-12 text-center lg:text-left">
        <h1 className="font-bebas text-2xl sm:text-4xl tracking-tighter text-white">
          M<span className="text-emerald-500">.</span>FIT
        </h1>
        {userRole === 'admin' && <span className="hidden lg:block font-mono-tech text-[9px] text-emerald-500 uppercase tracking-widest mt-2">COMMANDER ACCESS</span>}
        {userRole === 'client' && <span className="hidden lg:block font-mono-tech text-[9px] text-blue-500 uppercase tracking-widest mt-2">OPERATIVE ACCESS</span>}
      </div>

      <nav className="flex-1 space-y-1 px-2 lg:px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 lg:py-4 transition-all group relative btn-press ${
              activeView === item.id
                ? 'bg-white/5 text-white'
                : 'text-neutral-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} className={activeView === item.id ? 'text-emerald-400' : ''} />
            <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.15em]">
              {item.label}
            </span>
            {activeView === item.id && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="px-2 lg:px-3 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 lg:py-4 text-neutral-600 hover:text-red-500 transition-all group btn-press"
        >
          <LogOut size={18} />
          <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.15em]">Log Out</span>
        </button>
      </div>
    </div>
  );
};
