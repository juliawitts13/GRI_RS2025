import type { Pilar, StatusEntrevista, StatusIndicador, StatusProjeto } from '@/types/db'

export const STATUS_ORDER: StatusIndicador[] = [
  'nao_iniciado',
  'em_andamento',
  'aguardando_validacao',
  'devolvido_area',
  'concluido',
]

export const STATUS_LABEL: Record<StatusIndicador, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  aguardando_validacao: 'Validação Consultoria',
  devolvido_area: 'Devolvido à área',
  concluido: 'Concluído',
}

export const STATUS_COLOR: Record<StatusIndicador, { bg: string; text: string; dot: string }> = {
  nao_iniciado: { bg: 'bg-status-nao-iniciado/10', text: 'text-status-nao-iniciado', dot: 'bg-status-nao-iniciado' },
  em_andamento: { bg: 'bg-status-em-andamento/10', text: 'text-orange-600', dot: 'bg-status-em-andamento' },
  aguardando_validacao: { bg: 'bg-status-aguardando/10', text: 'text-status-aguardando', dot: 'bg-status-aguardando' },
  devolvido_area: { bg: 'bg-status-devolvido/10', text: 'text-status-devolvido', dot: 'bg-status-devolvido' },
  concluido: { bg: 'bg-status-concluido/10', text: 'text-status-concluido', dot: 'bg-status-concluido' },
}

/** Status que contam como "preenchido" pela área para fins de progresso, mesmo sem estar concluído. */
export const STATUS_PREENCHIDO: StatusIndicador[] = ['aguardando_validacao', 'concluido']

/**
 * Peso de cada status na barra de progresso geral (0 a 1) — um indicador em validação da
 * consultoria já avançou bastante, mesmo sem estar concluído, então não deve contar como 0%.
 */
export const STATUS_PROGRESSO_PESO: Record<StatusIndicador, number> = {
  nao_iniciado: 0,
  em_andamento: 0.4,
  devolvido_area: 0.4,
  aguardando_validacao: 0.8,
  concluido: 1,
}

export const STATUS_PROJETO_ORDER: StatusProjeto[] = ['nao_iniciado', 'em_andamento', 'concluido']

export const STATUS_PROJETO_LABEL: Record<StatusProjeto, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

export const STATUS_PROJETO_COLOR: Record<StatusProjeto, { bg: string; text: string; dot: string }> = {
  nao_iniciado: { bg: 'bg-status-nao-iniciado/10', text: 'text-status-nao-iniciado', dot: 'bg-status-nao-iniciado' },
  em_andamento: { bg: 'bg-status-em-andamento/10', text: 'text-orange-600', dot: 'bg-status-em-andamento' },
  concluido: { bg: 'bg-status-concluido/10', text: 'text-status-concluido', dot: 'bg-status-concluido' },
}

export const STATUS_ENTREVISTA_ORDER: StatusEntrevista[] = ['pendente', 'agendada', 'realizada']

export const STATUS_ENTREVISTA_LABEL: Record<StatusEntrevista, string> = {
  pendente: 'Pendente',
  agendada: 'Agendada',
  realizada: 'Realizada',
}

export const STATUS_ENTREVISTA_COLOR: Record<StatusEntrevista, { bg: string; text: string; dot: string }> = {
  pendente: { bg: 'bg-status-nao-iniciado/10', text: 'text-status-nao-iniciado', dot: 'bg-status-nao-iniciado' },
  agendada: { bg: 'bg-status-aguardando/10', text: 'text-status-aguardando', dot: 'bg-status-aguardando' },
  realizada: { bg: 'bg-status-concluido/10', text: 'text-status-concluido', dot: 'bg-status-concluido' },
}

/** Peso de cada status de entrevista na barra de progresso geral (0 a 1). */
export const STATUS_ENTREVISTA_PROGRESSO_PESO: Record<StatusEntrevista, number> = {
  pendente: 0,
  agendada: 0.5,
  realizada: 1,
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
