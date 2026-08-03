import type { Indicador } from '@/types/db'

/**
 * Progresso geral = % de indicadores com status 'concluido'.
 * Decisão de negócio confirmada com a Júlia após remover o módulo de Cronograma.
 */
export function calcularProgressoGeral(indicadores: Indicador[]): number {
  if (indicadores.length === 0) return 0
  const concluidos = indicadores.filter((i) => i.status === 'concluido').length
  return Math.round((concluidos / indicadores.length) * 100)
}

export function formatarDataBr(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function diasAteVencer(iso: string | null | undefined): number | null {
  if (!iso) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const prazo = new Date(iso + 'T00:00:00')
  return Math.round((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Dias corridos desde uma data (positivo = no passado). */
export function diasDesde(iso: string | null | undefined): number | null {
  if (!iso) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(iso + 'T00:00:00')
  return Math.round((hoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24))
}
