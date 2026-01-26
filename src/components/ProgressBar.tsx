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
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-32">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
        {remaining}/{total} remaining
      </span>
    </div>
  );
}
