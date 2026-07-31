import type { StatusIndicador } from '@/types/db'
import { STATUS_COLOR, STATUS_LABEL } from '@/lib/domain'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: StatusIndicador }) {
  const c = STATUS_COLOR[status]
  return (
    <Badge className={cn(c.bg, c.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {STATUS_LABEL[status]}
    </Badge>
  )
}
