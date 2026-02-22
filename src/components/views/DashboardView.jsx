import { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Users, DollarSign, Calendar, Clock, ChevronRight } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';

// Animated counter hook
const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const num = parseFloat(target) || 0;
    if (num === 0) { setCount(0); return; }
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * num);
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(num);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
};

const StatCard = ({ label, value, prefix = '', suffix = '', icon: Icon, color = 'white', onClick }) => {
  const animatedValue = useCounter(parseFloat(value) || 0);
  const isInteger = Number.isInteger(parseFloat(value));

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 sm:p-6 card-hover ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">{label}</span>
        {Icon && <Icon size={14} className={`text-${color === 'emerald' ? 'emerald-500' : color === 'red' ? 'red-500' : 'neutral-500'}`} />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-bebas text-3xl sm:text-4xl counter-value ${color === 'emerald' ? 'text-emerald-400' : color === 'red' ? 'text-red-400' : 'text-white'}`}>
          {prefix}{isInteger ? Math.round(animatedValue) : animatedValue.toFixed(2)}{suffix}
        </span>
      </div>
    </div>
  );
};

export const DashboardView = ({
  sessions,
  routines,
  payments,
  wellness,
  myAssignedRoutine,
  userRole,
  onViewChange,
  onUpdateWellness
}) => {
  const [staggerReady, setStaggerReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStaggerReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stagger = (i) => ({
    opacity: staggerReady ? 1 : 0,
    transform: staggerReady ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`
  });

  // Compute dashboard data
  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' });

  const todaySessions = sessions.filter(s => s.day === todayDay);
  const overduePayments = payments.filter(p => p.status === 'atrasado' || p.status === 'pendiente');
  const thisMonth = today.getMonth();
  const thisMonthRevenue = payments
    .filter(p => p.status === 'pagado' && new Date(p.created_at).getMonth() === thisMonth)
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const thisWeekSessions = sessions.length;
  const activeClients = new Set(sessions.flatMap(s => (s.participants || []).map(p => p.id))).size;

  if (userRole === 'admin') {
    return (
      <div className="space-y-8">
        {/* Overdue Alert */}
        {overduePayments.length > 0 && (
          <div style={stagger(0)} className="alert-overdue p-5 flex items-center gap-4 cursor-pointer btn-press" onClick={() => onViewChange('finance')}>
            <div className="flex items-center gap-3">
              <span className="status-dot danger"></span>
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <span className="font-mono-tech text-xs text-red-400 uppercase tracking-widest font-bold">
                {overduePayments.length} Pago{overduePayments.length > 1 ? 's' : ''} Vencido{overduePayments.length > 1 ? 's' : ''}
              </span>
              <p className="font-mono-tech text-[9px] text-red-400/60 mt-1">
                {overduePayments.slice(0, 3).map(p => p.name || p.client?.email || 'Unknown').join(', ')}
                {overduePayments.length > 3 && ` +${overduePayments.length - 3} más`}
              </p>
            </div>
            <span className="font-bebas text-2xl text-red-400">
              ${overduePayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0).toFixed(0)}
            </span>
            <ChevronRight size={16} className="text-red-400/50" />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div style={stagger(1)}>
            <StatCard label="Revenue This Month" value={thisMonthRevenue} prefix="$" icon={DollarSign} color="emerald" onClick={() => onViewChange('finance')} />
          </div>
          <div style={stagger(2)}>
            <StatCard label="Active Clients" value={activeClients} icon={Users} color="white" onClick={() => onViewChange('clients')} />
          </div>
          <div style={stagger(3)}>
            <StatCard label="Sessions This Week" value={thisWeekSessions} icon={Calendar} color="white" onClick={() => onViewChange('schedule')} />
          </div>
          <div style={stagger(4)}>
            <StatCard label="Overdue Payments" value={overduePayments.length} icon={AlertTriangle} color={overduePayments.length > 0 ? 'red' : 'white'} onClick={() => onViewChange('finance')} />
          </div>
        </div>

        {/* Today's Sessions + Finance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={stagger(5)}>
            <section className="glass-panel p-6 sm:p-8 relative">
              <SectionHeader number="01" title="Today's Sessions" />
              <div className="space-y-3 mt-4">
                {todaySessions.length > 0 ? todaySessions.map((s, i) => (
                  <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 card-hover" style={stagger(6 + i)}>
                    <div className="flex items-center gap-3">
                      <span className="status-dot live"></span>
                      <div>
                        <span className="font-mono-tech text-xs text-white">{s.time}</span>
                        <div className="font-mono-tech text-[9px] text-neutral-500 mt-0.5">
                          {(s.participants || []).map(p => p.email?.split('@')[0] || 'Client').join(', ') || 'No clients'}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono-tech text-[10px] text-neutral-500">{(s.participants || []).length}/{s.capacity || 4}</span>
                  </div>
                )) : (
                  <div className="p-6 border border-dashed border-white/10 text-center">
                    <span className="font-mono-tech text-xs text-neutral-600">NO SESSIONS TODAY</span>
                  </div>
                )}
                <button onClick={() => onViewChange('schedule')} className="w-full py-3 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-400 transition-all btn-press">
                  Full Schedule →
                </button>
              </div>
            </section>
          </div>

          <div style={stagger(6)}>
            <section className="glass-panel p-6 sm:p-8 relative">
              <SectionHeader number="02" title="Finance" />
              <div className="space-y-3 mt-4">
                {payments.slice(0, 4).map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5" style={stagger(7 + i)}>
                    <div className="flex items-center gap-3">
                      <span className={`status-dot ${p.status === 'pagado' ? 'live' : p.status === 'atrasado' ? 'danger' : 'warning'}`}></span>
                      <span className="font-mono-tech text-xs text-white">{p.name || p.client?.email || 'Unknown'}</span>
                    </div>
                    <span className={`font-mono-tech text-[10px] uppercase ${p.status === 'pagado' ? 'text-emerald-500' : p.status === 'atrasado' ? 'text-red-500' : 'text-yellow-500'}`}>
                      ${p.amount} // {p.status}
                    </span>
                  </div>
                ))}
                <button onClick={() => onViewChange('finance')} className="w-full py-3 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-400 transition-all btn-press">
                  Open Ledger →
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Biometric Flow */}
        <div style={stagger(8)}>
          <section className="glass-panel p-6 sm:p-10 relative overflow-hidden">
            <SectionHeader number="03" title="Biometric Flow" />
            <button onClick={onUpdateWellness} className="absolute top-6 right-6 sm:top-10 sm:right-10 p-2 text-neutral-500 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all btn-press"><Activity size={18} /></button>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-8">
              <div className="space-y-1">
                <p className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">Hydration</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-bebas text-4xl sm:text-5xl text-white counter-value">{wellness.water_liters}</span>
                  <span className="font-bebas text-xl text-neutral-600">L</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">Recovery</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-bebas text-4xl sm:text-5xl text-white counter-value">{wellness.sleep_hours}</span>
                  <span className="font-bebas text-xl text-neutral-600">HRS</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">Stress</p>
                <span className="font-bebas text-4xl sm:text-5xl text-white">{wellness.stress_level || '—'}</span>
              </div>
              <div className="space-y-1">
                <p className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">Diet Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-bebas text-4xl sm:text-5xl text-white counter-value">{wellness.diet_score || 0}</span>
                  <span className="font-bebas text-xl text-neutral-600">/10</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // CLIENT VIEW
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={stagger(0)}>
          <section className="glass-panel p-6 sm:p-8 relative border-l-2 border-white/20">
            <SectionHeader number="01" title="Mission Schedule" />
            <div className="space-y-3 mt-4">
              {sessions.slice(0, 3).map((s, i) => (
                <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5" style={stagger(1 + i)}>
                  <span className="font-mono-tech text-xs text-white">{s.day} {s.time}</span>
                  <span className="font-mono-tech text-[10px] text-neutral-500 uppercase">{s.participants?.length || 0}/{s.capacity || 4}</span>
                </div>
              ))}
              <button onClick={() => onViewChange('schedule')} className="w-full py-3 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all btn-press">Full Schedule</button>
            </div>
          </section>
        </div>

        <div style={stagger(1)}>
          <section className="glass-panel p-6 sm:p-8 relative border-l-2 border-emerald-500/20">
            <SectionHeader number="02" title="Active Mission" />
            {myAssignedRoutine ? (
              <div className="space-y-4 mt-4">
                <div className="p-6 bg-emerald-900/10 border border-emerald-500/30">
                  <h3 className="font-bebas text-2xl text-emerald-500">{myAssignedRoutine.name}</h3>
                  <p className="font-mono-tech text-xs text-emerald-200 mt-2">{Array.isArray(myAssignedRoutine.exercises) ? myAssignedRoutine.exercises.length : 1} EXERCISES</p>
                </div>
                <button onClick={() => onViewChange('my_routine')} className="w-full py-4 bg-white text-black font-mono-tech text-[9px] font-bold uppercase tracking-widest btn-press hover:bg-emerald-400 transition-colors">VIEW FULL DETAILS</button>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center border border-dashed border-white/10 mt-4">
                <span className="font-mono-tech text-xs text-neutral-500">NO ORDERS ASSIGNED</span>
              </div>
            )}
          </section>
        </div>
      </div>

      <div style={stagger(2)}>
        <section className="glass-panel p-6 sm:p-10 relative overflow-hidden border-r-2 border-white/20">
          <SectionHeader number="03" title="Biometric Flow" />
          <button onClick={onUpdateWellness} className="absolute top-6 right-6 sm:top-10 sm:right-10 p-2 text-neutral-500 hover:text-white border border-transparent hover:border-white/10 transition-all btn-press"><Activity size={18} /></button>
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="space-y-1"><p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Hydration</p><div className="flex items-baseline gap-2"><span className="font-bebas text-5xl text-white">{wellness.water_liters}</span><span className="font-bebas text-2xl text-neutral-600">L</span></div></div>
            <div className="space-y-1 text-right"><p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Recovery</p><div className="flex items-baseline justify-end gap-2"><span className="font-bebas text-5xl text-white">{wellness.sleep_hours}</span><span className="font-bebas text-2xl text-neutral-600">HRS</span></div></div>
          </div>
        </section>
      </div>
    </div>
  );
};
