import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MeasurementCard = ({ label, current, previous, unit = 'kg', format = '1' }) => {
  const currentValue = parseFloat(current);
  const previousValue = parseFloat(previous);

  let change = null;
  let changePercent = null;
  let trend = null;

  if (currentValue && previousValue) {
    change = currentValue - previousValue;
    changePercent = ((change / previousValue) * 100).toFixed(1);

    if (Math.abs(change) < 0.1) {
      trend = 'stable';
    } else if (change > 0) {
      trend = 'up';
    } else {
      trend = 'down';
    }
  }

  const formatValue = (value) => {
    if (!value) return '--';
    return parseFloat(value).toFixed(parseInt(format));
  };

  return (
    <div className="bg-white/5 border border-white/10 p-4 hover:border-emerald-500/30 transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest">{label}</span>
        {trend && (
          <div className={`flex items-center gap-1 ${
            trend === 'up' ? 'text-emerald-500' :
            trend === 'down' ? 'text-blue-500' :
            'text-neutral-500'
          }`}>
            {trend === 'up' && <TrendingUp size={12} />}
            {trend === 'down' && <TrendingDown size={12} />}
            {trend === 'stable' && <Minus size={12} />}
            <span className="font-mono-tech text-[8px]">
              {change > 0 ? '+' : ''}{change.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-bebas text-4xl text-white">{formatValue(current)}</span>
        <span className="font-mono-tech text-sm text-neutral-600">{unit}</span>
      </div>
      {previousValue && (
        <div className="mt-2 text-[9px] font-mono-tech text-neutral-600">
          Previous: {formatValue(previous)} {unit}
        </div>
      )}
    </div>
  );
};
