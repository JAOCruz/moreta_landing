import { useState, useEffect } from 'react';
import { ChevronRight, Trash2, Users } from 'lucide-react';

export const CommandModal = ({ isOpen, title, fields, onSubmit, onCancel, onDelete, participants = [], routines = [] }) => {
  const [formData, setFormData] = useState({});
  const [squadData, setSquadData] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      fields.forEach(f => initial[f.name] = f.defaultValue || '');
      setFormData(initial);
      setSquadData(participants);
    }
  }, [isOpen, fields, participants]);

  const handleAssignRoutineToUser = (userId, routineId) => {
    const updatedSquad = squadData.map(p =>
      p.id === userId ? { ...p, assigned_routine_id: routineId } : p
    );
    setSquadData(updatedSquad);
  };

  const handleSubmit = () => {
    onSubmit(formData, squadData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="fixed inset-0 tactical-grid opacity-20 pointer-events-none"></div>

      <div className="glass-panel w-full max-w-2xl p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        {/* Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/40"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/40"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/40"></div>

        <div className="flex items-center gap-4 mb-8">
          <ChevronRight size={18} className="text-white animate-pulse" />
          <h2 className="font-bebas text-3xl tracking-wider text-white uppercase">{title}</h2>
        </div>

        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.3em] block ml-1">{field.label}</label>

              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full bg-neutral-900/50 border border-white/10 px-5 py-4 font-mono-tech text-xs text-white focus:outline-none focus:border-white/40 transition-all rounded-none"
                >
                  <option value="">-- SELECT --</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  autoFocus={field.name === fields[0].name}
                  type={field.type || 'text'}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-neutral-900/50 border border-white/10 px-5 py-4 font-mono-tech text-xs text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/40 transition-all rounded-none"
                />
              )}
            </div>
          ))}

          {/* SQUAD MANAGEMENT (Admin Only) */}
          {squadData.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-4 text-neutral-500">
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span className="font-mono-tech text-[10px] uppercase tracking-widest">Active Squad ({squadData.length})</span>
                </div>
                <span className="font-mono-tech text-[8px] uppercase tracking-widest">ASSIGN SPECIFIC ORDERS</span>
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                {squadData.map((p, i) => (
                  <div key={i} className="bg-white/5 p-3 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="font-mono-tech text-[10px] text-white truncate max-w-[150px]">{p.email}</span>
                    </div>
                    {/* PER-USER ROUTINE SELECTOR */}
                    <select
                      value={p.assigned_routine_id || ''}
                      onChange={(e) => handleAssignRoutineToUser(p.id, e.target.value)}
                      className="bg-black/50 border border-white/10 text-[9px] text-white py-1 px-2 font-mono-tech focus:border-emerald-500 outline-none w-40"
                    >
                      <option value="">-- NO ROUTINE --</option>
                      {routines.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-10">
          {onDelete && (
            <button onClick={onDelete} className="px-4 py-4 border border-red-900/50 bg-red-900/10 text-red-500 font-mono-tech text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={onCancel} className="flex-1 py-4 border border-neutral-800 text-neutral-500 font-mono-tech text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">// CANCEL</button>
          <button onClick={handleSubmit} className="flex-1 py-4 bg-white text-black font-mono-tech text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">EXECUTE ORDERS</button>
        </div>
      </div>
    </div>
  );
};
