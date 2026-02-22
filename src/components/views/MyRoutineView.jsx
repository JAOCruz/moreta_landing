import { AlertTriangle } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';

export const MyRoutineView = ({ routine }) => {
  return (
    <div className="max-w-3xl mx-auto glass-panel p-4 sm:p-6 lg:p-10 border-t-4 border-emerald-500">
      <SectionHeader number="01" title="Daily Orders" />
      {routine ? (
        <div>
          <div className="mb-8">
            <h1 className="font-bebas text-6xl text-white mb-2">{routine.name}</h1>
            <span className="font-mono-tech text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1">{routine.category} DIVISION</span>
          </div>
          <div className="space-y-4">
            {(Array.isArray(routine.exercises) ? routine.exercises : []).map((ex, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group">
                <div className="h-12 w-12 flex items-center justify-center bg-black border border-white/10 font-bebas text-xl text-neutral-500 group-hover:text-emerald-500">{i + 1}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{ex.name}</h3>
                  <p className="font-mono-tech text-xs text-neutral-400">TARGET: {ex.sets} SETS // {ex.reps} REPS</p>
                </div>
                <div className="h-6 w-6 border border-white/20 rounded-sm cursor-pointer hover:bg-emerald-500/50"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={32} />
          <h2 className="font-bebas text-3xl">NO MISSION DATA</h2>
          <p className="font-mono-tech text-xs text-neutral-500 mt-2">CONTACT COMMANDER FOR ASSIGNMENT</p>
        </div>
      )}
    </div>
  );
};
