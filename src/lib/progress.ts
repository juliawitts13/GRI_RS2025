/** Datas fixas do projeto, extraídas do Cronograma.xlsx (fase "Preparação" até "Entrega do Relatório"). */
export const PROJETO_INICIO = new Date('2026-01-28T00:00:00')
export const PROJETO_FIM = new Date('2026-12-08T00:00:00')

/**
 * Progresso geral por linha do tempo: (hoje − início) / (fim − início), 0-100.
 * Decisão de negócio confirmada com a Júlia — não usa contagem de status manual.
 */
export function calcularProgressoGeral(hoje: Date = new Date()): number {
  const total = PROJETO_FIM.getTime() - PROJETO_INICIO.getTime()
  const decorrido = hoje.getTime() - PROJETO_INICIO.getTime()
  const pct = (decorrido / total) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
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
