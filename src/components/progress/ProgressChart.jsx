// Simple progress chart component (line chart)
export const ProgressChart = ({ data, dataKey, label, unit, color = '#10b981' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-white/10">
        <p className="font-mono-tech text-xs text-neutral-600">No data available</p>
      </div>
    );
  }

  // Find min/max values for scaling
  const values = data.map(d => parseFloat(d[dataKey])).filter(v => !isNaN(v));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (chartWidth - 2 * padding);
    const value = parseFloat(d[dataKey]);
    const y = chartHeight - padding - ((value - min) / range) * (chartHeight - 2 * padding);
    return { x, y, value, date: d.measured_at || d.workout_date };
  });

  // Generate SVG path
  const pathData = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-mono-tech text-xs text-neutral-400 uppercase tracking-widest">{label}</h4>
        <span className="font-mono-tech text-xs text-neutral-600">{unit}</span>
      </div>

      <div className="bg-neutral-900 border border-white/10 p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-64"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + ratio * (chartHeight - 2 * padding);
            return (
              <line
                key={ratio}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            );
          })}

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Area under curve */}
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
            fill={color}
            fillOpacity="0.1"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill={color}
                className="hover:r-6 transition-all cursor-pointer"
              />
              <title>{`${new Date(p.date).toLocaleDateString()}: ${p.value.toFixed(1)} ${unit}`}</title>
            </g>
          ))}

          {/* Y-axis labels */}
          {[max, (max + min) / 2, min].map((value, i) => {
            const y = padding + (i * 0.5) * (chartHeight - 2 * padding);
            return (
              <text
                key={i}
                x={padding - 10}
                y={y}
                textAnchor="end"
                className="fill-neutral-600 font-mono-tech text-[10px]"
              >
                {value.toFixed(1)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Latest value */}
      <div className="flex justify-between items-center text-sm">
        <span className="font-mono-tech text-neutral-500">Latest:</span>
        <span className="font-bebas text-2xl text-emerald-500">
          {values[values.length - 1].toFixed(1)} {unit}
        </span>
      </div>
    </div>
  );
};
