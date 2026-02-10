import { TrendingUp, TrendingDown, DollarSign, Users, Calendar } from 'lucide-react';

export const FinancialSummaryCard = ({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }) => {
  const colorClasses = {
    emerald: 'text-emerald-500 border-emerald-500/30',
    red: 'text-red-500 border-red-500/30',
    blue: 'text-blue-500 border-blue-500/30',
    neutral: 'text-neutral-500 border-neutral-500/30'
  };

  return (
    <div className="glass-panel p-4 border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 bg-white/5 border ${colorClasses[color]}`}>
          <Icon size={20} className={colorClasses[color].split(' ')[0]} />
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <>
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="font-mono-tech text-[9px] text-emerald-500">
                  +{trend}%
                </span>
              </>
            ) : trend < 0 ? (
              <>
                <TrendingDown size={14} className="text-red-500" />
                <span className="font-mono-tech text-[9px] text-red-500">
                  {trend}%
                </span>
              </>
            ) : (
              <span className="font-mono-tech text-[9px] text-neutral-500">
                0%
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="font-bebas text-3xl text-white mb-1">{value}</div>
        <div className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest">
          {title}
        </div>
        {subtitle && (
          <div className="font-mono-tech text-[8px] text-neutral-600 mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
