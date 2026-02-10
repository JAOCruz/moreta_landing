import { X } from 'lucide-react';

export const ClientSessionModal = ({ isOpen, session, routine, onLeave, onClose }) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="fixed inset-0 tactical-grid opacity-20 pointer-events-none"></div>
      <div className="glass-panel w-full max-w-lg p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="font-mono-tech text-[10px] text-emerald-500 uppercase tracking-widest">ACTIVE SESSION</span>
            <h2 className="font-bebas text-4xl text-white mt-1">{session.day} @ {session.time}</h2>
            <p className="font-mono-tech text-xs text-neutral-400 mt-1">{session.date}</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={20} /></button>
        </div>

        {routine ? (
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-white/5 border border-white/10">
              <span className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">ASSIGNED PROTOCOL</span>
              <h3 className="font-bold text-xl text-white">{routine.name}</h3>
              <span className="text-[10px] font-mono-tech text-emerald-500 bg-emerald-500/10 px-2 py-1 mt-2 inline-block">{routine.category}</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {Array.isArray(routine.exercises) && routine.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-neutral-900 border border-white/5">
                  <span className="font-mono-tech text-xs text-white">{i + 1}. {ex.name}</span>
                  <span className="font-mono-tech text-[10px] text-neutral-400">{ex.sets} x {ex.reps}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-white/10 text-center mb-8">
            <p className="font-mono-tech text-xs text-neutral-500">NO ORDERS ASSIGNED YET</p>
          </div>
        )}

        <button onClick={onLeave} className="w-full py-4 bg-red-500/10 border border-red-500/50 text-red-500 font-mono-tech text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
          LEAVE SESSION SLOT
        </button>
      </div>
    </div>
  );
};
