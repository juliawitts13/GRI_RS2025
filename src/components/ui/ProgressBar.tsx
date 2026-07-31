import { cn } from '@/lib/utils'

export function ProgressBar({
  value,
  className,
  trackClassName,
  barClassName,
}: {
  value: number
  className?: string
  trackClassName?: string
  barClassName?: string
}) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('h-3 w-full overflow-hidden rounded-full bg-navy-100', trackClassName, className)}>
      <div
        className={cn('h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500', barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
