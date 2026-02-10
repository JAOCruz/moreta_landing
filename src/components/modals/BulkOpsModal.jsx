import { useState } from 'react';
import { X } from 'lucide-react';

export const BulkOpsModal = ({ isOpen, onClose, currentWeek, onCopyWeek, onClearWeek, onFillMonth }) => {
  const [operation, setOperation] = useState('copy');
  const [weeksAhead, setWeeksAhead] = useState(1);

  if (!isOpen) return null;

  const handleExecute = () => {
    if (operation === 'copy') {
      const targetWeek = new Date(currentWeek);
      targetWeek.setDate(targetWeek.getDate() + (weeksAhead * 7));
      onCopyWeek(currentWeek, targetWeek);
      onClose();
    } else if (operation === 'clear') {
      onClearWeek(currentWeek);
      onClose();
    } else if (operation === 'pattern') {
      // Example pattern: MWF at 6am and 6pm
      const pattern = [
        { day: 'LUN', time: '06:00', capacity: 4 },
        { day: 'LUN', time: '18:00', capacity: 4 },
        { day: 'MIE', time: '06:00', capacity: 4 },
        { day: 'MIE', time: '18:00', capacity: 4 },
        { day: 'VIE', time: '06:00', capacity: 4 },
        { day: 'VIE', time: '18:00', capacity: 4 },
      ];
      onFillMonth(pattern);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-lg p-10 relative border border-white/20">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-bebas text-3xl text-white">BULK OPERATIONS</h2>
            <p className="font-mono-tech text-xs text-neutral-400 mt-2">Mass schedule management</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest block mb-3">Operation Type</label>
            <div className="space-y-2">
              <button
                onClick={() => setOperation('copy')}
                className={`w-full p-4 text-left border transition-all ${operation === 'copy' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <div className="font-bold text-sm text-white">Copy Week Pattern</div>
                <div className="font-mono-tech text-xs text-neutral-400 mt-1">Duplicate this week's schedule to future weeks</div>
              </button>

              <button
                onClick={() => setOperation('pattern')}
                className={`w-full p-4 text-left border transition-all ${operation === 'pattern' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <div className="font-bold text-sm text-white">Fill Month (MWF Pattern)</div>
                <div className="font-mono-tech text-xs text-neutral-400 mt-1">Auto-fill entire month with Mon/Wed/Fri @ 6am & 6pm</div>
              </button>

              <button
                onClick={() => setOperation('clear')}
                className={`w-full p-4 text-left border transition-all ${operation === 'clear' ? 'bg-red-500/20 border-red-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <div className="font-bold text-sm text-white">Clear This Week</div>
                <div className="font-mono-tech text-xs text-neutral-400 mt-1">Delete all sessions in current week</div>
              </button>
            </div>
          </div>

          {operation === 'copy' && (
            <div>
              <label className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest block mb-3">Copy to week (ahead)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={weeksAhead}
                onChange={(e) => setWeeksAhead(parseInt(e.target.value))}
                className="w-full bg-black border border-white/20 p-4 font-mono-tech text-white text-center text-2xl"
              />
              <p className="font-mono-tech text-xs text-neutral-500 mt-2">
                Target: {new Date(new Date(currentWeek).setDate(currentWeek.getDate() + (weeksAhead * 7))).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-10">
          <button onClick={onClose} className="flex-1 py-4 border border-neutral-800 text-neutral-500 font-mono-tech text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">Cancel</button>
          <button
            onClick={handleExecute}
            className={`flex-1 py-4 font-mono-tech text-[10px] font-bold uppercase tracking-widest transition-all ${operation === 'clear'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-black hover:bg-emerald-500 hover:text-white'
              }`}
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
};
