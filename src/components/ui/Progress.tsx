import { cn } from '../../utils/helpers';

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
};

const variantStyles = {
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500'
};

export function ProgressBar({
  value,
  size = 'md',
  showLabel = false,
  variant = 'primary',
  className
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Progreso
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantStyles[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// CIRCULAR PROGRESS
// ============================================================================

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const circleVariantStyles = {
  primary: 'stroke-primary-500',
  success: 'stroke-green-500',
  warning: 'stroke-amber-500',
  danger: 'stroke-red-500'
};

export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 6,
  showLabel = true,
  variant = 'primary',
  className
}: CircularProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn(circleVariantStyles[variant], 'transition-all duration-500 ease-out')}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-bold text-slate-700 dark:text-slate-300">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}

export default ProgressBar;
