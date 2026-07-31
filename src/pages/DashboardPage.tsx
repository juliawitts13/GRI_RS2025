import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ClipboardList, TrendingUp } from 'lucide-react'
import { useIndicadores } from '@/hooks/useIndicadores'
import { useCronograma } from '@/hooks/useCronograma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { STATUS_LABEL, STATUS_ORDER, STATUS_COLOR } from '@/lib/domain'
import { calcularProgressoGeral, diasAteVencer, formatarDataBr, PROJETO_FIM, PROJETO_INICIO } from '@/lib/progress'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { indicadores } = useIndicadores()
  const { tarefas } = useCronograma()

  const progresso = calcularProgressoGeral()

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

  const fasesResumo = useMemo(() => {
    const grupos = new Map<string, { total: number; feito: number; inicio: string; fim: string }>()
    for (const t of tarefas) {
      if (t.nivel !== 0) continue
      const g = grupos.get(t.fase) ?? { total: 0, feito: 0, inicio: t.data_inicio ?? '', fim: t.data_fim ?? '' }
      g.total++
      if (t.status === 'Feito') g.feito++
      if (t.data_inicio && t.data_inicio < g.inicio) g.inicio = t.data_inicio
      if (t.data_fim && t.data_fim > g.fim) g.fim = t.data_fim
      grupos.set(t.fase, g)
    }
    return Array.from(grupos.entries())
  }, [tarefas])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Visão geral do projeto</h1>
        <p className="text-sm text-navy-700/70">Relatório de Sustentabilidade 2025 — GrupoSC</p>
      </div>

      <Card className="overflow-hidden bg-navy-900 p-6 text-white md:p-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">Progresso geral</p>
            <p className="text-4xl font-extrabold md:text-5xl">{progresso}%</p>
          </div>
          <p className="text-right text-xs text-white/60">
            {formatarDataBr(PROJETO_INICIO.toISOString().slice(0, 10))} até{' '}
            {formatarDataBr(PROJETO_FIM.toISOString().slice(0, 10))}
          </p>
        </div>
        <ProgressBar value={progresso} trackClassName="bg-white/15" className="h-4" />
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
              <CalendarClock size={14} /> Próximos prazos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {proximosPrazos.length === 0 ? (
              <p className="text-sm text-navy-700/60">Nenhum prazo pendente cadastrado.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-navy-100">
                {proximosPrazos.map(({ ind, dias }) => (
                  <li key={ind.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-navy-950">
                        {ind.codigo_gri} · {ind.titulo}
                      </p>
                      <p className="text-xs text-navy-700/60">
                        {formatarDataBr(ind.prazo)} {dias !== null && (dias < 0 ? `(${-dias}d atrasado)` : `(em ${dias}d)`)}
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
              <TrendingUp size={14} /> Fases do cronograma
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-3">
            {fasesResumo.map(([fase, g]) => (
              <div key={fase}>
                <div className="mb-1 flex justify-between text-xs font-semibold text-navy-950">
                  <span>{fase}</span>
                  <span className="text-navy-700/60">
                    {g.feito}/{g.total}
                  </span>
                </div>
                <ProgressBar value={g.total ? (g.feito / g.total) * 100 : 0} className="h-1.5" />
              </div>
            ))}
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
