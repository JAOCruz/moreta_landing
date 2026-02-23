import { useState, useRef, useEffect } from 'react';
import {
  Home, Clock, Dumbbell, DollarSign, Settings, LogOut,
  ClipboardList, TrendingUp, Users, Sliders
} from 'lucide-react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../ui/Avatar';

export const Sidebar = ({ activeView, onViewChange, onLogout, userRole, overdueCount = 0, session }) => {
  const { t } = useTranslation();
  const indicatorRef = useRef(null);
  const navRef = useRef(null);
  const mobileIndicatorRef = useRef(null);

  const menuItems = [
    { id: 'dashboard', icon: Home, label: t('sidebar.home') },
    { id: 'schedule', icon: Clock, label: t('sidebar.schedule') },
    ...(userRole === 'admin' ? [
      { id: 'builder', icon: Dumbbell, label: t('sidebar.builder') },
      { id: 'clients', icon: Users, label: t('sidebar.clients') },
      { id: 'finance', icon: DollarSign, label: t('sidebar.finance'), badge: overdueCount > 0 ? overdueCount : null },
      { id: 'admin_settings', icon: Sliders, label: t('sidebar.business') }
    ] : []),
    ...(userRole === 'client' ? [
      { id: 'my_routine', icon: ClipboardList, label: t('sidebar.routine') },
      { id: 'progress', icon: TrendingUp, label: t('sidebar.progress') }
    ] : []),
    { id: 'settings', icon: Settings, label: t('sidebar.settings') }
  ];

  // Animate desktop indicator on view change
  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;
    const activeBtn = navRef.current.querySelector(`[data-view="${activeView}"]`);
    if (activeBtn) {
      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      gsap.to(indicatorRef.current, {
        top: btnRect.top - navRect.top,
        height: btnRect.height,
        duration: 0.35,
        ease: 'power2.out'
      });
    }
  }, [activeView, menuItems.length]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-20 lg:w-64 border-r border-white/5 bg-[#0a0a0a] flex-col items-center lg:items-stretch py-8 relative z-[60]">
        <div className="px-3 lg:px-6 mb-8 lg:mb-12 text-center lg:text-left">
          <h1 className="font-bebas text-3xl lg:text-4xl tracking-tighter text-white">
            M<span className="text-emerald-500">.</span>FIT
          </h1>
          {userRole === 'admin' && <span className="hidden lg:block font-mono-tech text-[9px] text-emerald-500 uppercase tracking-widest mt-2">{t('sidebar.commanderAccess')}</span>}
          {userRole === 'client' && <span className="hidden lg:block font-mono-tech text-[9px] text-blue-500 uppercase tracking-widest mt-2">{t('sidebar.operativeAccess')}</span>}
          {session?.user && (
            <div className="hidden lg:flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
              <Avatar userId={session.user.id} email={session.user.email} size={32} />
              <span className="font-mono-tech text-[9px] text-neutral-400 truncate">{session.user.email?.split('@')[0]}</span>
            </div>
          )}
        </div>

        <nav ref={navRef} className="flex-1 space-y-1 px-2 lg:px-3 relative">
          {/* Sliding active indicator */}
          <div
            ref={indicatorRef}
            className="absolute right-0 w-[2px] bg-emerald-400 transition-none z-10"
            style={{ boxShadow: '0 0 12px rgba(52,211,153,0.6)', height: 0 }}
          />

          {menuItems.map((item) => (
            <button
              key={item.id}
              data-view={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 lg:py-4 transition-all group relative btn-press ${
                activeView === item.id
                  ? 'bg-white/5 text-white sidebar-active-glow'
                  : 'text-neutral-500 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <div className="relative">
                <item.icon
                  size={18}
                  className={`transition-all duration-300 ${activeView === item.id ? 'text-emerald-400 nav-icon-glow' : 'group-hover:scale-110'}`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-[8px] font-bold text-white flex items-center justify-center rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.15em]">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="px-2 lg:px-3 mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 lg:py-4 text-neutral-600 hover:text-red-500 transition-all group btn-press"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.15em]">{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] flex md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 bottom-nav">
        <div className="flex w-full justify-around items-center px-2 py-1" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
          {menuItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 min-h-[44px] min-w-[44px] transition-all btn-press relative ${
                activeView === item.id ? 'text-white' : 'text-neutral-600'
              }`}
            >
              <div className="relative">
                <item.icon
                  size={20}
                  className={`transition-all duration-300 ${activeView === item.id ? 'text-emerald-400 nav-icon-glow' : ''}`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-[7px] font-bold text-white flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="font-mono-tech text-[8px] uppercase tracking-wider">{item.label}</span>
              {activeView === item.id && (
                <div className="w-1 h-1 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
              )}
            </button>
          ))}
          {menuItems.length > 5 && (
            <button
              onClick={() => onViewChange(menuItems[menuItems.length - 1].id)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 min-h-[44px] min-w-[44px] transition-all btn-press ${
                activeView === 'settings' || menuItems.slice(5).some(m => m.id === activeView) ? 'text-white' : 'text-neutral-600'
              }`}
            >
              <Settings
                size={20}
                className={`transition-all duration-300 ${activeView === 'settings' || menuItems.slice(5).some(m => m.id === activeView) ? 'text-emerald-400 nav-icon-glow' : ''}`}
              />
              <span className="font-mono-tech text-[8px] uppercase tracking-wider">More</span>
              {(activeView === 'settings' || menuItems.slice(5).some(m => m.id === activeView)) && (
                <div className="w-1 h-1 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
