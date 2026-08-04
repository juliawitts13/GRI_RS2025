import type { Pilar, StatusIndicador } from '@/types/db'

export const STATUS_ORDER: StatusIndicador[] = [
  'nao_iniciado',
  'em_andamento',
  'aguardando_validacao',
  'concluido',
]

export const STATUS_LABEL: Record<StatusIndicador, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  aguardando_validacao: 'Validação Consultoria',
  concluido: 'Concluído',
}

export const STATUS_COLOR: Record<StatusIndicador, { bg: string; text: string; dot: string }> = {
  nao_iniciado: { bg: 'bg-status-nao-iniciado/10', text: 'text-status-nao-iniciado', dot: 'bg-status-nao-iniciado' },
  em_andamento: { bg: 'bg-status-em-andamento/10', text: 'text-orange-600', dot: 'bg-status-em-andamento' },
  aguardando_validacao: { bg: 'bg-status-aguardando/10', text: 'text-status-aguardando', dot: 'bg-status-aguardando' },
  concluido: { bg: 'bg-status-concluido/10', text: 'text-status-concluido', dot: 'bg-status-concluido' },
}

export const PILAR_LABEL: Record<Pilar, string> = {
  geral: 'Geral',
  economico: 'Econômico',
  ambiental: 'Ambiental',
  social: 'Social',
}

export const PILAR_COLOR: Record<Pilar, { bg: string; text: string }> = {
  geral: { bg: 'bg-pillar-geral-100', text: 'text-pillar-geral' },
  economico: { bg: 'bg-navy-100', text: 'text-navy-900' },
  ambiental: { bg: 'bg-pillar-ambiental-100', text: 'text-pillar-ambiental' },
  social: { bg: 'bg-pillar-social-100', text: 'text-pillar-social' },
}
