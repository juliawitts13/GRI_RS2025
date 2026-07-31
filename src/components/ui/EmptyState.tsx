import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-navy-100 bg-white/60 px-6 py-16 text-center">
      {icon && <div className="text-navy-700/40">{icon}</div>}
      <p className="text-base font-semibold text-navy-950">{title}</p>
      {description && <p className="max-w-md text-sm text-navy-700/70">{description}</p>}
      {action}
    </div>
  )
}
