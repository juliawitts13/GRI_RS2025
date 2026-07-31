import type { Pilar } from '@/types/db'
import { PILAR_COLOR, PILAR_LABEL } from '@/lib/domain'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function PillarBadge({ pilar }: { pilar: Pilar }) {
  const c = PILAR_COLOR[pilar]
  return <Badge className={cn(c.bg, c.text)}>{PILAR_LABEL[pilar]}</Badge>
}
