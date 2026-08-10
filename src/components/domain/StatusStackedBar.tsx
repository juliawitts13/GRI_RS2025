import { STATUS_COLOR, STATUS_LABEL, STATUS_ORDER } from '@/lib/domain'
import { cn } from '@/lib/utils'
import type { StatusIndicador } from '@/types/db'

export function StatusStackedBar({
  counts,
  className,
}: {
  counts: Record<StatusIndicador, number>
  className?: string
}) {
  const total = STATUS_ORDER.reduce((acc, s) => acc + (counts[s] ?? 0), 0)

  return (
    <div className={cn('flex h-2 w-full overflow-hidden rounded-full bg-navy-100', className)}>
      {total > 0 &&
        STATUS_ORDER.map((s) => {
          const n = counts[s] ?? 0
          if (n === 0) return null
          return <div key={s} className={STATUS_COLOR[s].dot} style={{ width: `${(n / total) * 100}%` }} />
        })}
    </div>
  )
}

export function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {STATUS_ORDER.map((s) => (
        <span key={s} className="flex items-center gap-1 text-[11px] text-navy-700/60">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_COLOR[s].dot)} />
          {STATUS_LABEL[s]}
        </span>
      ))}
    </div>
  )
}
