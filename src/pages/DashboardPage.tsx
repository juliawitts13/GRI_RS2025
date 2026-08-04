import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ClipboardList, Building2 } from 'lucide-react'
import { useIndicadores } from '@/hooks/useIndicadores'
import { useAreas } from '@/hooks/useAreas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { STATUS_LABEL, STATUS_ORDER, STATUS_COLOR, STATUS_PREENCHIDO } from '@/lib/domain'
import { calcularProgressoGeral, diasAteVencer, formatarDataBr } from '@/lib/progress'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { indicadores } = useIndicadores()
  const { areas } = useAreas()

  const progresso = calcularProgressoGeral(indicadores)

  const contagemStatus = useMemo(() => {
    const base: Record<string, number> = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]))
    for (const ind of indicadores) base[ind.status]++
    return base
  }, [indicadores])

  const proximosPrazos = useMemo(() => {
    return indicadores
      .filter((i) => i.prazo && i.status !== 'concluido')
      .map((i) => ({ ind: i, dias: diasAteVencer(i.prazo) }))
      .sort((a, b) => (a.dias ?? 0) - (b.dias ?? 0))
      .slice(0, 6)
  }, [indicadores])

  const resumoPorArea = useMemo(() => {
    const semArea = indicadores.filter((i) => !i.area_id).length
    const porArea = areas.map((a) => {
      const doArea = indicadores.filter((i) => i.area_id === a.id)
      const preenchidos = doArea.filter((i) => STATUS_PREENCHIDO.includes(i.status)).length
      return { nome: a.nome, total: doArea.length, preenchidos }
    })
    if (semArea > 0) porArea.push({ nome: 'Sem área definida', total: semArea, preenchidos: 0 })
    return porArea
  }, [indicadores, areas])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Visão geral da coleta</h1>
        <p className="text-sm text-navy-700/70">Relatório de Sustentabilidade 2025 — GrupoSC</p>
      </div>

      <Card className="overflow-hidden bg-navy-900 p-6 text-white md:p-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">Progresso geral</p>
            <p className="text-4xl font-extrabold md:text-5xl">{progresso}%</p>
          </div>
          <p className="text-right text-xs text-white/60">
            {contagemStatus.concluido} de {indicadores.length} indicadores concluídos
          </p>
        </div>
        <ProgressBar value={progresso} trackClassName="bg-white/15" className="h-4" />
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {STATUS_ORDER.map((s) => (
          <Card key={s} className="p-4">
            <p className={cn('mb-1 h-1.5 w-8 rounded-full', STATUS_COLOR[s].dot)} />
            <p className="text-2xl font-extrabold text-navy-950">{contagemStatus[s]}</p>
            <p className="text-xs font-semibold text-navy-700/70">{STATUS_LABEL[s]}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock size={14} /> Próximas entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {proximosPrazos.length === 0 ? (
              <p className="text-sm text-navy-700/60">Nenhuma data de entrega pendente cadastrada.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-navy-100">
                {proximosPrazos.map(({ ind, dias }) => (
                  <li key={ind.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-navy-950">
                        {ind.codigo_gri} · {ind.titulo}
                      </p>
                      <p className="text-xs text-navy-700/60">
                        {formatarDataBr(ind.prazo)}{' '}
                        {dias !== null &&
                          ind.status !== 'aguardando_validacao' &&
                          (dias < 0 ? `(${-dias}d atrasado)` : `(em ${dias}d)`)}
                      </p>
                    </div>
                    <StatusBadge status={ind.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={14} /> Indicadores por área
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-3">
            {resumoPorArea.length === 0 ? (
              <p className="text-sm text-navy-700/60">Nenhuma área cadastrada ainda.</p>
            ) : (
              resumoPorArea.map((a) => (
                <div key={a.nome}>
                  <div className="mb-1 flex justify-between text-xs font-semibold text-navy-950">
                    <span>{a.nome}</span>
                    <span className="text-navy-700/60">
                      {a.preenchidos}/{a.total}
                    </span>
                  </div>
                  <ProgressBar value={a.total ? (a.preenchidos / a.total) * 100 : 0} className="h-1.5" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-navy-700/50" size={22} />
          <div>
            <p className="text-sm font-semibold text-navy-950">Coleta de Indicadores</p>
            <p className="text-xs text-navy-700/60">{indicadores.length} indicadores GRI cadastrados</p>
          </div>
        </div>
        <Link to="/indicadores" className="text-sm font-semibold text-orange-600 hover:underline">
          Ver todos →
        </Link>
      </Card>
    </div>
  )
}
