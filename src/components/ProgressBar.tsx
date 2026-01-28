'use client';

interface ProgressBarProps {
  remaining: number;
  total: number;
}

export function ProgressBar({ remaining, total }: ProgressBarProps) {
  const used = total - remaining;
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-void border border-neon-gold/50 rounded-full overflow-hidden max-w-32">
        <div
          className="h-full bg-gradient-to-r from-neon-gold to-yellow-500 transition-all duration-300"
          style={{
            width: `${percentage}%`,
            boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)'
          }}
        />
      </div>
      <span className="font-display text-sm font-bold text-neon-gold whitespace-nowrap">
        {remaining}/{total}
      </span>
    </div>
  );
}
