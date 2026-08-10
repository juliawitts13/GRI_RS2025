import { STATUS_ENTREVISTA_PROGRESSO_PESO, STATUS_PROGRESSO_PESO } from './domain'
import type { Entrevista, Indicador } from '@/types/db'

/**
 * Progresso geral = média ponderada do status de cada indicador + entrevista, sobre o total
 * combinado. Um indicador em validação da consultoria já avançou bastante mesmo sem estar
 * concluído, então pesa mais que "em andamento" mas menos que "concluído" — ver STATUS_PROGRESSO_PESO.
 */
export function calcularProgressoGeral(indicadores: Indicador[], entrevistas: Entrevista[] = []): number {
  const total = indicadores.length + entrevistas.length
  if (total === 0) return 0
  const pesoIndicadores = indicadores.reduce((acc, i) => acc + STATUS_PROGRESSO_PESO[i.status], 0)
  const pesoEntrevistas = entrevistas.reduce((acc, e) => acc + STATUS_ENTREVISTA_PROGRESSO_PESO[e.status], 0)
  return Math.round(((pesoIndicadores + pesoEntrevistas) / total) * 100)
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
