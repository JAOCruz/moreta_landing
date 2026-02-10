import { Activity } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <section className="glass-panel p-8 relative border-l-2 border-white/20">
        <SectionHeader number="01" title="Mission Schedule" />
        <div className="space-y-4">
          {sessions.slice(0, 3).map((s) => (
            <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
              <span className="font-mono-tech text-xs text-white">{s.day} {s.time}</span>
              <span className="font-mono-tech text-[10px] text-neutral-500 uppercase">{s.participants?.length || 0}/{s.capacity || 4} Clients</span>
            </div>
          ))}
          <button onClick={() => onViewChange('schedule')} className="w-full py-4 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">Full Schedule</button>
        </div>
      </section>

      {userRole === 'admin' ? (
        <>
          <section className="glass-panel p-8 relative">
            <SectionHeader number="02" title="Routine Engine" />
            <div className="space-y-4">
              {routines.slice(0, 3).map((r, i) => (
                <div key={r.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                  <span className="font-mono-tech text-xs text-white">{String(i + 1).padStart(2, '0')} // {r.name}</span>
                  <span className="font-mono-tech text-[10px] text-neutral-500 uppercase">{Array.isArray(r.exercises) ? r.exercises.length + ' EXERCISES' : r.sets}</span>
                </div>
              ))}
              <button onClick={() => onViewChange('builder')} className="w-full py-4 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">Engineer Program</button>
            </div>
          </section>
          <section className="glass-panel p-8">
            <SectionHeader number="03" title="Finance" />
            <div className="space-y-4">
              {payments.slice(0, 3).map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                  <span className="font-mono-tech text-xs text-white">{p.name}</span>
                  <span className={`font-mono-tech text-[10px] uppercase ${p.status === 'pagado' ? 'text-emerald-500' : 'text-red-500'}`}>${p.amount} // {p.status}</span>
                </div>
              ))}
              <button onClick={() => onViewChange('finance')} className="w-full py-4 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">Open Ledger</button>
            </div>
          </section>
        </>
      ) : (
        <section className="glass-panel p-8 relative border-l-2 border-emerald-500/20">
          <SectionHeader number="02" title="Active Mission" />
          {myAssignedRoutine ? (
            <div className="space-y-4">
              <div className="p-6 bg-emerald-900/10 border border-emerald-500/30">
                <h3 className="font-bebas text-2xl text-emerald-500">{myAssignedRoutine.name}</h3>
                <p className="font-mono-tech text-xs text-emerald-200 mt-2">{Array.isArray(myAssignedRoutine.exercises) ? myAssignedRoutine.exercises.length : 1} EXERCISES LOGGED</p>
              </div>
              <button onClick={() => onViewChange('my_routine')} className="w-full py-4 bg-white text-black font-mono-tech text-[9px] font-bold uppercase tracking-widest">VIEW FULL DETAILS</button>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center border border-dashed border-white/10">
              <span className="font-mono-tech text-xs text-neutral-500">NO ORDERS ASSIGNED</span>
            </div>
          )}
        </section>
      )}

      {/* CLIENT WELLNESS VIEW */}
      <section className="glass-panel p-10 relative overflow-hidden border-r-2 border-white/20">
        <SectionHeader number="04" title="Biometric Flow" />
        <button onClick={onUpdateWellness} className="absolute top-10 right-10 p-2 text-neutral-500 hover:text-white border border-transparent hover:border-white/10 transition-all"><Activity size={18} /></button>
        <div className="grid grid-cols-2 gap-8 mt-10">
          <div className="space-y-1"><p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Hydration</p><div className="flex items-baseline gap-2"><span className="font-bebas text-5xl text-white">{wellness.water_liters}</span><span className="font-bebas text-2xl text-neutral-600">L</span></div></div>
          <div className="space-y-1 text-right"><p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Recovery</p><div className="flex items-baseline justify-end gap-2"><span className="font-bebas text-5xl text-white">{wellness.sleep_hours}</span><span className="font-bebas text-2xl text-neutral-600">HRS</span></div></div>
        </div>
      </section>
    </div>
  );
};
