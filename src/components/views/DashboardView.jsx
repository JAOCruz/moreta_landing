import { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Users, DollarSign, Calendar, Clock, ChevronRight, Zap, Target } from 'lucide-react';
import gsap from 'gsap';
import { SectionHeader } from '../ui/SectionHeader';

// Animated counter hook
const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
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

const StatCard = ({ label, value, prefix = '', suffix = '', icon: Icon, color = 'white', onClick, delay = 0 }) => {
  const animatedValue = useCounter(parseFloat(value) || 0);
  const isInteger = Number.isInteger(parseFloat(value));
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay, ease: 'power3.out' }
      );
    }
  }, [delay]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`glass-panel p-5 sm:p-6 magnetic-hover ${onClick ? 'cursor-pointer' : ''} opacity-0`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded ${color === 'emerald' ? 'bg-emerald-500/10' : color === 'red' ? 'bg-red-500/10' : 'bg-white/5'}`}>
            <Icon size={14} className={`${color === 'emerald' ? 'text-emerald-500' : color === 'red' ? 'text-red-500' : 'text-neutral-500'}`} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-bebas text-3xl sm:text-4xl counter-value ${color === 'emerald' ? 'text-emerald-400' : color === 'red' ? 'text-red-400' : 'text-white'}`}>
          {prefix}{isInteger ? Math.round(animatedValue) : animatedValue.toFixed(2)}{suffix}
        </span>
      </div>
    </div>
  );
};

// Timeline session item
const TimelineItem = ({ session, index, isLast }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.6 + index * 0.1, ease: 'power2.out' }
      );
    }
  }, [index]);

  const participants = session.participants || [];
  return (
    <div ref={ref} className="flex gap-4 opacity-0">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-400/30 shadow-[0_0_8px_rgba(52,211,153,0.4)] flex-shrink-0 mt-1" />
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-emerald-500/30 to-transparent min-h-[40px]" />}
      </div>
      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 transition-all group cursor-pointer">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bebas text-xl text-white group-hover:text-emerald-400 transition-colors">{session.time}</span>
              <span className="status-dot live" />
            </div>
            <div className="font-mono-tech text-[9px] text-neutral-500 mt-1">
              {participants.map(p => p.email?.split('@')[0] || 'Client').join(', ') || 'Open slot'}
            </div>
          </div>
          <span className="font-mono-tech text-[10px] text-neutral-600">{participants.length}/{session.capacity || 4}</span>
        </div>
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
  const containerRef = useRef(null);

  // GSAP stagger entrance
  useEffect(() => {
    if (containerRef.current) {
      const panels = containerRef.current.querySelectorAll('.dash-section');
      gsap.fromTo(panels,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, []);

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
      <div ref={containerRef} className="space-y-8">
        {/* Overdue Alert */}
        {overduePayments.length > 0 && (
          <div className="dash-section alert-overdue p-5 flex items-center gap-4 cursor-pointer btn-press magnetic-hover opacity-0" onClick={() => onViewChange('finance')}>
            <div className="flex items-center gap-3">
              <span className="status-dot danger" />
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
        <div className="dash-section grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-0">
          <StatCard label="Revenue This Month" value={thisMonthRevenue} prefix="$" icon={DollarSign} color="emerald" onClick={() => onViewChange('finance')} delay={0.2} />
          <StatCard label="Active Clients" value={activeClients} icon={Users} color="white" onClick={() => onViewChange('clients')} delay={0.3} />
          <StatCard label="Sessions This Week" value={thisWeekSessions} icon={Calendar} color="white" onClick={() => onViewChange('schedule')} delay={0.4} />
          <StatCard label="Overdue Payments" value={overduePayments.length} icon={AlertTriangle} color={overduePayments.length > 0 ? 'red' : 'white'} onClick={() => onViewChange('finance')} delay={0.5} />
        </div>

        {/* Today's Timeline + Quick Actions + Finance */}
        <div className="dash-section grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-0">
          {/* Today's Timeline */}
          <div className="lg:col-span-2">
            <section className="glass-panel p-6 sm:p-8 relative">
              <SectionHeader number="01" title="Today's Timeline" />
              <div className="mt-4">
                {todaySessions.length > 0 ? (
                  <div className="pl-1">
                    {todaySessions.map((s, i) => (
                      <TimelineItem key={s.id} session={s} index={i} isLast={i === todaySessions.length - 1} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-white/10 text-center">
                    <Clock size={24} className="mx-auto text-neutral-700 mb-2" />
                    <span className="font-mono-tech text-xs text-neutral-600">NO SESSIONS TODAY</span>
                  </div>
                )}
                <button onClick={() => onViewChange('schedule')} className="w-full mt-3 py-3 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-400 transition-all btn-press">
                  Full Schedule →
                </button>
              </div>
            </section>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <section className="glass-panel p-5 relative">
              <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em] block mb-4">Quick Actions</span>
              <div className="space-y-2">
                {[
                  { label: 'Schedule', icon: Calendar, view: 'schedule', color: 'emerald' },
                  { label: 'Clients', icon: Users, view: 'clients', color: 'white' },
                  { label: 'Finance', icon: DollarSign, view: 'finance', color: 'emerald' },
                  { label: 'Builder', icon: Zap, view: 'builder', color: 'white' },
                ].map(action => (
                  <button
                    key={action.view}
                    onClick={() => onViewChange(action.view)}
                    className="w-full flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all group btn-press"
                  >
                    <action.icon size={16} className="text-neutral-500 group-hover:text-emerald-400 transition-colors" />
                    <span className="font-mono-tech text-xs text-neutral-400 group-hover:text-white transition-colors">{action.label}</span>
                    <ChevronRight size={12} className="ml-auto text-neutral-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </section>

            {/* Finance snapshot */}
            <section className="glass-panel p-5 relative">
              <SectionHeader number="02" title="Finance" />
              <div className="space-y-2 mt-3">
                {payments.slice(0, 3).map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`status-dot ${p.status === 'pagado' ? 'live' : p.status === 'atrasado' ? 'danger' : 'warning'}`} />
                      <span className="font-mono-tech text-[10px] text-white truncate max-w-[100px]">{p.name || 'Unknown'}</span>
                    </div>
                    <span className={`font-mono-tech text-[9px] uppercase ${p.status === 'pagado' ? 'text-emerald-500' : p.status === 'atrasado' ? 'text-red-500' : 'text-yellow-500'}`}>
                      ${p.amount}
                    </span>
                  </div>
                ))}
                <button onClick={() => onViewChange('finance')} className="w-full py-2 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-400 transition-all btn-press">
                  Open Ledger →
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Biometric Flow */}
        <div className="dash-section opacity-0">
          <section className="glass-panel p-6 sm:p-10 relative overflow-hidden">
            <SectionHeader number="03" title="Biometric Flow" />
            <button onClick={onUpdateWellness} className="absolute top-6 right-6 sm:top-10 sm:right-10 p-2 text-neutral-500 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all btn-press hover:scale-110">
              <Activity size={18} />
            </button>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-8">
              {[
                { label: 'Hydration', value: wellness.water_liters, unit: 'L' },
                { label: 'Recovery', value: wellness.sleep_hours, unit: 'HRS' },
                { label: 'Stress', value: wellness.stress_level || '—', unit: '' },
                { label: 'Diet Score', value: wellness.diet_score || 0, unit: '/10' },
              ].map((metric, i) => (
                <div key={metric.label} className="space-y-1">
                  <p className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">{metric.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bebas text-4xl sm:text-5xl text-white counter-value">{metric.value}</span>
                    {metric.unit && <span className="font-bebas text-xl text-neutral-600">{metric.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // CLIENT VIEW
  return (
    <div ref={containerRef} className="space-y-8">
      <div className="dash-section grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-0">
        <section className="glass-panel p-6 sm:p-8 relative border-l-2 border-white/20">
          <SectionHeader number="01" title="Mission Schedule" />
          <div className="space-y-3 mt-4">
            {sessions.slice(0, 3).map((s, i) => (
              <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 card-hover">
                <div className="flex items-center gap-2">
                  <span className="status-dot live" />
                  <span className="font-mono-tech text-xs text-white">{s.day} {s.time}</span>
                </div>
                <span className="font-mono-tech text-[10px] text-neutral-500 uppercase">{s.participants?.length || 0}/{s.capacity || 4}</span>
              </div>
            ))}
            <button onClick={() => onViewChange('schedule')} className="w-full py-3 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all btn-press">Full Schedule</button>
          </div>
        </section>

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

      <div className="dash-section opacity-0">
        <section className="glass-panel p-6 sm:p-10 relative overflow-hidden border-r-2 border-white/20">
          <SectionHeader number="03" title="Biometric Flow" />
          <button onClick={onUpdateWellness} className="absolute top-6 right-6 sm:top-10 sm:right-10 p-2 text-neutral-500 hover:text-white border border-transparent hover:border-white/10 transition-all btn-press hover:scale-110">
            <Activity size={18} />
          </button>
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="space-y-1"><p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Hydration</p><div className="flex items-baseline gap-2"><span className="font-bebas text-5xl text-white">{wellness.water_liters}</span><span className="font-bebas text-2xl text-neutral-600">L</span></div></div>
            <div className="space-y-1 text-right"><p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Recovery</p><div className="flex items-baseline justify-end gap-2"><span className="font-bebas text-5xl text-white">{wellness.sleep_hours}</span><span className="font-bebas text-2xl text-neutral-600">HRS</span></div></div>
          </div>
        </section>
      </div>
    </div>
  );
};
