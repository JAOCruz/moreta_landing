// Premium skeleton loading components
export const SkeletonPulse = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/5 ${className}`} />
);

export const SkeletonCard = ({ lines = 3 }) => (
  <div className="glass-panel p-6 space-y-4">
    <SkeletonPulse className="h-3 w-24 rounded" />
    <SkeletonPulse className="h-8 w-32 rounded" />
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonPulse key={i} className="h-3 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
    ))}
  </div>
);

export const SkeletonGrid = ({ count = 4, cols = 4 }) => (
  <div className={`grid grid-cols-2 lg:grid-cols-${cols} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} lines={2} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="glass-panel overflow-hidden border border-white/10">
    <div className="p-5 border-b border-white/5">
      <SkeletonPulse className="h-3 w-40 rounded" />
    </div>
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="w-8 h-8 rounded" />
            <div className="space-y-2">
              <SkeletonPulse className="h-3 w-32 rounded" />
              <SkeletonPulse className="h-2 w-20 rounded" />
            </div>
          </div>
          <SkeletonPulse className="h-6 w-16 rounded" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="glass-panel p-6 border border-white/10">
    <div className="flex justify-between mb-6">
      <SkeletonPulse className="h-6 w-40 rounded" />
      <div className="flex gap-4">
        <SkeletonPulse className="h-4 w-20 rounded" />
        <SkeletonPulse className="h-4 w-20 rounded" />
      </div>
    </div>
    <div className="flex items-end gap-2 h-48">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className="flex-1 rounded-t"
          style={{ height: `${30 + Math.random() * 70}%` }}
        />
      ))}
    </div>
  </div>
);
