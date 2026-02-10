import React from 'react';
import { Plus, Layout } from 'lucide-react';
import { DAYS, HOURS } from '../../constants/schedule';

export const ScheduleView = ({
  currentWeekStart,
  sessionMap,
  userRole,
  userId,
  onToggleAvailability,
  onWeekChange,
  onBulkOps
}) => {
  return (
    <div className="mb-20">
      <div className="flex justify-between items-center mb-6 px-1">
        <div className="flex gap-4">
          <button
            onClick={() => onWeekChange(-7)}
            className="px-4 py-2 border border-white/10 hover:bg-white/5 font-mono-tech text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {'< PREV WEEK'}
          </button>
          <button
            onClick={() => onWeekChange(7)}
            className="px-4 py-2 border border-white/10 hover:bg-white/5 font-mono-tech text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {'NEXT WEEK >'}
          </button>
          <button
            onClick={() => onWeekChange(0)}
            className="px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 font-mono-tech text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            THIS WEEK
          </button>
          {userRole === 'admin' && (
            <button
              onClick={onBulkOps}
              className="px-4 py-2 border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 font-mono-tech text-xs text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-2"
            >
              <Layout size={14} />
              BULK OPS
            </button>
          )}
        </div>
        <span className="font-bebas text-xl tracking-widest text-emerald-500 text-right">WEEK OF: {currentWeekStart.toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-2 min-w-[800px]">
        <div className="h-12"></div>
        {DAYS.map(day => <div key={day} className="h-12 flex items-center justify-center bg-neutral-900/50 border border-white/5 font-mono-tech text-[10px] text-neutral-400 uppercase tracking-widest">{day}</div>)}
        {HOURS.map((hour, index) => {
          if (hour === '---') return <div key={`spacer-${index}`} className="col-span-8 h-8 flex items-center justify-center bg-neutral-900/30 border-y border-white/5"><span className="font-mono-tech text-[9px] text-neutral-600 tracking-[0.5em]">SIESTA // BREAK</span></div>;
          return (
            <React.Fragment key={hour}>
              <div className="h-16 flex items-center justify-center font-mono-tech text-[10px] text-neutral-600 border-r border-white/5">{hour}</div>
              {DAYS.map(day => {
                const key = `${day}-${hour}`;
                const session = sessionMap.get(key);

                const count = session?.participants?.length || 0;
                const cap = session?.capacity || 4;
                const isJoined = session?.participants?.some(p => p.id === userId);

                let style = "bg-neutral-900/10 border border-white/5 opacity-50 hover:opacity-100";
                if (session) {
                  if (userRole === 'admin') {
                    if (count === 0) style = "bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 opacity-100";
                    else if (count < cap) style = "bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 opacity-100";
                    else style = "bg-red-500/10 border border-red-500/50 text-red-500 opacity-100";
                  } else {
                    if (isJoined) style = "bg-emerald-500/20 border border-emerald-500 text-emerald-500 opacity-100 ring-1 ring-emerald-500/50";
                    else if (count >= cap) style = "bg-red-500/10 border border-red-500/20 text-red-500/50 opacity-100 cursor-not-allowed";
                    else style = "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500/70 hover:bg-emerald-500/20 hover:text-emerald-500 opacity-100 cursor-pointer";
                  }
                } else {
                  if (userRole === 'client') style = "opacity-0 cursor-default";
                }

                return (
                  <div
                    key={key}
                    onClick={() => onToggleAvailability(day, hour)}
                    className={`h-16 transition-all active:scale-95 group relative flex flex-col items-center justify-center p-1 text-center overflow-hidden ${style} ${session ? 'cursor-pointer' : ''}`}
                  >
                    {session ? (
                      <>
                        <span className="font-bebas text-lg tracking-widest">{count} <span className="text-[10px] opacity-50">/ {cap}</span></span>
                        <span className="font-mono-tech text-[7px] uppercase tracking-widest opacity-70">
                          {userRole === 'client' && isJoined ? "JOINED" : userRole === 'client' && count >= cap ? "FULL" : "OPEN"}
                        </span>
                      </>
                    ) : (
                      userRole === 'admin' && <div className="opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={12} className="text-white/30" /></div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
