import React, { useState, useEffect } from 'react';
import { Plus, Layout, Info } from 'lucide-react';
import { DAYS, HOURS } from '../../constants/schedule';
import { supabase } from '../../lib/supabase';

export const EnhancedScheduleView = ({
  currentWeekStart,
  sessionMap,
  userRole,
  userId,
  onToggleAvailability,
  onWeekChange,
  onBulkOps
}) => {
  const [sessionTypes, setSessionTypes] = useState([]);
  const [sessionTypesMap, setSessionTypesMap] = useState(new Map());

  useEffect(() => {
    fetchSessionTypes();
  }, []);

  const fetchSessionTypes = async () => {
    const { data, error } = await supabase
      .from('session_types')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      setSessionTypes(data);
      const typesMap = new Map();
      data.forEach(type => typesMap.set(type.id, type));
      setSessionTypesMap(typesMap);
    }
  };

  return (
    <div className="mb-20">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 px-1 gap-3">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={() => onWeekChange(-7)}
            className="px-3 sm:px-4 py-2 border border-white/10 hover:bg-white/5 font-mono-tech text-[10px] sm:text-xs text-neutral-400 hover:text-white transition-colors min-h-[44px]"
          >
            {'< PREV'}
          </button>
          <button
            onClick={() => onWeekChange(7)}
            className="px-3 sm:px-4 py-2 border border-white/10 hover:bg-white/5 font-mono-tech text-[10px] sm:text-xs text-neutral-400 hover:text-white transition-colors min-h-[44px]"
          >
            {'NEXT >'}
          </button>
          <button
            onClick={() => onWeekChange(0)}
            className="px-3 sm:px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 font-mono-tech text-[10px] sm:text-xs text-emerald-500 hover:text-emerald-400 transition-colors min-h-[44px]"
          >
            TODAY
          </button>
          {userRole === 'admin' && (
            <button
              onClick={onBulkOps}
              className="px-3 sm:px-4 py-2 border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 font-mono-tech text-[10px] sm:text-xs text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Layout size={14} />
              <span className="hidden sm:inline">BULK OPS</span>
            </button>
          )}
        </div>
        <span className="font-bebas text-lg sm:text-xl tracking-widest text-emerald-500">
          {currentWeekStart.toLocaleDateString()}
        </span>
      </div>

      {/* Session Type Legend */}
      {sessionTypes.length > 0 && (
        <div className="mb-4 p-4 glass-panel border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-neutral-500" />
            <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest">
              Session Types
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sessionTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center gap-2 px-3 py-1 border rounded-none"
                style={{
                  backgroundColor: `${type.color}15`,
                  borderColor: `${type.color}40`
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <span className="font-mono-tech text-[9px] text-white">
                  {type.name}
                </span>
                <span className="font-mono-tech text-[8px] text-neutral-500">
                  {type.duration_minutes}min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] sm:grid-cols-[80px_repeat(7,1fr)] gap-1 sm:gap-2 min-w-[640px]">
        <div className="h-12"></div>
        {DAYS.map(day => (
          <div
            key={day}
            className="h-12 flex items-center justify-center bg-neutral-900/50 border border-white/5 font-mono-tech text-[10px] text-neutral-400 uppercase tracking-widest"
          >
            {day}
          </div>
        ))}

        {HOURS.map((hour, index) => {
          if (hour === '---')
            return (
              <div
                key={`spacer-${index}`}
                className="col-span-8 h-8 flex items-center justify-center bg-neutral-900/30 border-y border-white/5"
              >
                <span className="font-mono-tech text-[9px] text-neutral-600 tracking-[0.5em]">
                  SIESTA // BREAK
                </span>
              </div>
            );

          return (
            <React.Fragment key={hour}>
              <div className="h-14 sm:h-16 flex items-center justify-center font-mono-tech text-[9px] sm:text-[10px] text-neutral-600 border-r border-white/5">
                {hour}
              </div>
              {DAYS.map(day => {
                const key = `${day}-${hour}`;
                const session = sessionMap.get(key);
                const sessionType = session?.session_type_id
                  ? sessionTypesMap.get(session.session_type_id)
                  : null;

                const count = session?.participants?.length || 0;
                const cap = session?.capacity || 4;
                const isJoined = session?.participants?.some(p => p.id === userId);

                let style = "bg-neutral-900/10 border border-white/5 opacity-50 hover:opacity-100";
                let textColor = "text-neutral-500";

                if (session) {
                  // Use session type color if available
                  const baseColor = sessionType?.color || '#10b981';

                  if (userRole === 'admin') {
                    if (count === 0) {
                      style = `border opacity-100`;
                      style += ` bg-[${baseColor}]/10 border-[${baseColor}]/50`;
                      textColor = `text-[${baseColor}]`;
                    } else if (count < cap) {
                      style = "bg-yellow-500/10 border border-yellow-500/50 opacity-100";
                      textColor = "text-yellow-500";
                    } else {
                      style = "bg-red-500/10 border border-red-500/50 opacity-100";
                      textColor = "text-red-500";
                    }
                  } else {
                    if (isJoined) {
                      style = `bg-emerald-500/20 border border-emerald-500 opacity-100 ring-1 ring-emerald-500/50`;
                      textColor = "text-emerald-500";
                    } else if (count >= cap) {
                      style = "bg-red-500/10 border border-red-500/20 opacity-100 cursor-not-allowed";
                      textColor = "text-red-500/50";
                    } else {
                      style = `border opacity-100 cursor-pointer hover:opacity-100`;
                      style += ` bg-[${baseColor}]/10 border-[${baseColor}]/30 hover:bg-[${baseColor}]/20`;
                      textColor = `text-[${baseColor}]/70 hover:text-[${baseColor}]`;
                    }
                  }
                } else {
                  if (userRole === 'client') style = "opacity-0 cursor-default";
                }

                return (
                  <div
                    key={key}
                    onClick={() => onToggleAvailability(day, hour)}
                    className={`h-14 sm:h-16 transition-all active:scale-95 group relative flex flex-col items-center justify-center p-1 text-center overflow-hidden ${style} ${session ? 'cursor-pointer' : ''}`}
                    style={sessionType ? {
                      backgroundColor: `${sessionType.color}10`,
                      borderColor: count >= cap ? '#ef4444' : count > 0 ? '#eab308' : `${sessionType.color}50`
                    } : {}}
                  >
                    {session ? (
                      <>
                        {/* Session Type Indicator */}
                        {sessionType && (
                          <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ backgroundColor: sessionType.color }}
                          />
                        )}

                        {/* Capacity Display */}
                        <span className={`font-bebas text-lg tracking-widest ${textColor}`}>
                          {count} <span className="text-[10px] opacity-50">/ {cap}</span>
                        </span>

                        {/* Session Type Name */}
                        {sessionType && (
                          <span className="font-mono-tech text-[7px] uppercase tracking-widest opacity-70 truncate max-w-full px-1">
                            {sessionType.name}
                          </span>
                        )}

                        {/* Status Label */}
                        <span className={`font-mono-tech text-[7px] uppercase tracking-widest opacity-70 ${textColor}`}>
                          {userRole === 'client' && isJoined
                            ? "JOINED"
                            : userRole === 'client' && count >= cap
                            ? "FULL"
                            : "OPEN"}
                        </span>
                      </>
                    ) : (
                      userRole === 'admin' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={12} className="text-white/30" />
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
      </div>
    </div>
  );
};
