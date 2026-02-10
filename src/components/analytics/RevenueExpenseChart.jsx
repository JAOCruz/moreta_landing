import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const RevenueExpenseChart = ({ data }) => {
  // data format: [{ month: 'Jan', revenue: 5000, expenses: 2000 }, ...]
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    }
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="glass-panel p-6 border border-white/10 text-center">
        <p className="font-mono-tech text-xs text-neutral-500">
          No financial data available for chart
        </p>
      </div>
    );
  }

  // Calculate dimensions and scales
  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find max value for scaling
  const maxRevenue = Math.max(...chartData.map(d => d.revenue || 0));
  const maxExpense = Math.max(...chartData.map(d => d.expenses || 0));
  const maxValue = Math.max(maxRevenue, maxExpense);
  const yScale = chartHeight / (maxValue * 1.1); // 10% padding

  // X scale
  const xStep = chartWidth / (chartData.length - 1 || 1);

  // Generate paths
  const revenuePath = chartData.map((d, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (d.revenue || 0) * yScale;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const expensePath = chartData.map((d, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (d.expenses || 0) * yScale;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Calculate totals
  const totalRevenue = chartData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalExpenses = chartData.reduce((sum, d) => sum + (d.expenses || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="glass-panel p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bebas text-2xl text-white">Revenue vs Expenses</h3>

        {/* Summary */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="font-mono-tech text-[9px] text-neutral-500 uppercase">Revenue</span>
            </div>
            <div className="font-bebas text-xl text-emerald-500">${totalRevenue.toLocaleString()}</div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="font-mono-tech text-[9px] text-neutral-500 uppercase">Expenses</span>
            </div>
            <div className="font-bebas text-xl text-red-500">${totalExpenses.toLocaleString()}</div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              {netProfit >= 0 ? (
                <TrendingUp className="text-emerald-500" size={14} />
              ) : (
                <TrendingDown className="text-red-500" size={14} />
              )}
              <span className="font-mono-tech text-[9px] text-neutral-500 uppercase">Net Profit</span>
            </div>
            <div className={`font-bebas text-xl ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              ${Math.abs(netProfit).toLocaleString()}
            </div>
            <div className="font-mono-tech text-[8px] text-neutral-600">
              {profitMargin}% margin
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ minHeight: '300px' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - padding - chartHeight * ratio;
            const value = (maxValue * ratio).toFixed(0);
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.3)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ${value}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {chartData.map((d, i) => {
            const x = padding + i * xStep;
            return (
              <text
                key={i}
                x={x}
                y={height - padding + 20}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
                fontFamily="monospace"
              >
                {d.month}
              </text>
            );
          })}

          {/* Revenue line */}
          <path
            d={revenuePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Expense line */}
          <path
            d={expensePath}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points - Revenue */}
          {chartData.map((d, i) => {
            const x = padding + i * xStep;
            const y = height - padding - (d.revenue || 0) * yScale;
            return (
              <circle
                key={`rev-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill="#10b981"
                stroke="#0a0a0a"
                strokeWidth="2"
              />
            );
          })}

          {/* Data points - Expenses */}
          {chartData.map((d, i) => {
            const x = padding + i * xStep;
            const y = height - padding - (d.expenses || 0) * yScale;
            return (
              <circle
                key={`exp-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill="#ef4444"
                stroke="#0a0a0a"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-emerald-500" />
          <span className="font-mono-tech text-[9px] text-neutral-500 uppercase">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-red-500" />
          <span className="font-mono-tech text-[9px] text-neutral-500 uppercase">Expenses</span>
        </div>
      </div>
    </div>
  );
};
