import { useState, useEffect } from 'react';
import { ChevronRight, Trash2, Users, Calendar, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const EnhancedSessionModal = ({
  isOpen,
  title,
  session,
  day,
  hour,
  onSubmit,
  onCancel,
  onDelete,
  participants = [],
  routines = []
}) => {
  const [formData, setFormData] = useState({
    capacity: 4,
    session_type_id: ''
  });
  const [squadData, setSquadData] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionTypes();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        capacity: session?.capacity || 4,
        session_type_id: session?.session_type_id || ''
      });
      setSquadData(participants);
    }
  }, [isOpen, session, participants]);

  const fetchSessionTypes = async () => {
    const { data, error } = await supabase
      .from('session_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setSessionTypes(data);
      // Set default to first session type if creating new
      if (!session && data.length > 0) {
        setFormData(prev => ({ ...prev, session_type_id: data[0].id }));
      }
    }
    setLoading(false);
  };

  const handleAssignRoutineToUser = (userId, routineId) => {
    const updatedSquad = squadData.map(p =>
      p.id === userId ? { ...p, assigned_routine_id: routineId } : p
    );
    setSquadData(updatedSquad);
  };

  const handleSubmit = () => {
    onSubmit(formData, squadData);
  };

  const selectedType = sessionTypes.find(t => t.id === formData.session_type_id);

  // Auto-adjust capacity based on session type
  useEffect(() => {
    if (selectedType && !session) {
      setFormData(prev => ({ ...prev, capacity: selectedType.max_capacity }));
    }
  }, [selectedType, session]);

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

        {loading ? (
          <div className="py-12 text-center">
            <p className="font-mono-tech text-xs text-neutral-500">Loading session types...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Session Info */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-none">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Calendar size={14} />
                  <span className="font-mono-tech text-xs">{day}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock size={14} />
                  <span className="font-mono-tech text-xs">{hour}</span>
                </div>
              </div>
            </div>

            {/* Session Type Selector */}
            <div className="space-y-2">
              <label className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.3em] block ml-1">
                Session Type *
              </label>
              <select
                value={formData.session_type_id}
                onChange={(e) => setFormData({ ...formData, session_type_id: e.target.value })}
                className="w-full bg-neutral-900/50 border border-white/10 px-5 py-4 font-mono-tech text-xs text-white focus:outline-none focus:border-white/40 transition-all rounded-none"
              >
                <option value="">-- SELECT SESSION TYPE --</option>
                {sessionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.duration_minutes}min (Max {type.max_capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Session Type Details */}
            {selectedType && (
              <div
                className="p-4 border rounded-none"
                style={{
                  backgroundColor: `${selectedType.color}10`,
                  borderColor: `${selectedType.color}30`
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white mb-1">{selectedType.name}</h4>
                    {selectedType.description && (
                      <p className="text-neutral-400 text-sm">{selectedType.description}</p>
                    )}
                  </div>
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: selectedType.color }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Clock size={12} />
                    <span className="font-mono-tech">{selectedType.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Users size={12} />
                    <span className="font-mono-tech">Max {selectedType.max_capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500">
                    <DollarSign size={12} />
                    <span className="font-mono-tech">Varies</span>
                  </div>
                </div>
              </div>
            )}

            {/* Capacity */}
            <div className="space-y-2">
              <label className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.3em] block ml-1">
                Capacity Limit
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                min="1"
                max={selectedType?.max_capacity || 20}
                className="w-full bg-neutral-900/50 border border-white/10 px-5 py-4 font-mono-tech text-xs text-white focus:outline-none focus:border-white/40 transition-all rounded-none"
              />
              {selectedType && formData.capacity > selectedType.max_capacity && (
                <p className="text-yellow-500 text-xs font-mono-tech ml-1">
                  ⚠ Exceeds recommended max capacity
                </p>
              )}
            </div>

            {/* SQUAD MANAGEMENT (Admin Only) */}
            {squadData.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-4 text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span className="font-mono-tech text-[10px] uppercase tracking-[0.3em]">
                      Participants ({squadData.length}/{formData.capacity})
                    </span>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {squadData.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <span className="font-bebas text-sm text-emerald-500">
                            {participant.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-mono-tech text-xs text-white">{participant.email}</span>
                      </div>

                      {routines.length > 0 && (
                        <select
                          value={participant.assigned_routine_id || ''}
                          onChange={(e) => handleAssignRoutineToUser(participant.id, e.target.value)}
                          className="bg-neutral-900/50 border border-white/10 px-3 py-2 font-mono-tech text-[9px] text-white focus:outline-none focus:border-white/40 transition-all rounded-none"
                        >
                          <option value="">No Routine</option>
                          {routines.map((routine) => (
                            <option key={routine.id} value={routine.id}>
                              {routine.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button
                onClick={handleSubmit}
                disabled={!formData.session_type_id}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-black disabled:text-neutral-500 py-4 px-6 font-mono-tech text-xs uppercase tracking-[0.3em] transition-all active:scale-95"
              >
                {session ? 'Update Session' : 'Create Session'}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-neutral-900/50 hover:bg-neutral-800 border border-white/10 text-white py-4 px-6 font-mono-tech text-xs uppercase tracking-[0.3em] transition-all active:scale-95"
              >
                Cancel
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 py-4 px-6 font-mono-tech text-xs uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
