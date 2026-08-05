import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, ClipboardList, Building2, BookOpen } from 'lucide-react'
import { useIndicadores } from '@/hooks/useIndicadores'
import { useAreas } from '@/hooks/useAreas'
import { useRespondentes } from '@/hooks/useRespondentes'
import { useIndicadorRespondentes } from '@/hooks/useIndicadorRespondentes'
import { useCapitulos } from '@/hooks/useCapitulos'
import { useIndicadorCapitulos } from '@/hooks/useIndicadorCapitulos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { STATUS_ORDER, STATUS_COLOR, STATUS_LABEL, STATUS_PREENCHIDO } from '@/lib/domain'
import { calcularProgressoGeral } from '@/lib/progress'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { indicadores } = useIndicadores()
  const { areas } = useAreas()
  const { respondentes } = useRespondentes()
  const { respondenteIdsDoIndicador } = useIndicadorRespondentes()
  const { capitulos } = useCapitulos()
  const { indicadorIdsDoCapitulo } = useIndicadorCapitulos()

  const progresso = calcularProgressoGeral(indicadores)

  const respondenteNomePorId = useMemo(() => new Map(respondentes.map((r) => [r.id, r.nome])), [respondentes])

  const contagemStatus = useMemo(() => {
    const base: Record<string, number> = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]))
    for (const ind of indicadores) base[ind.status]++
    return base
  }, [indicadores])

  const resumoPorRespondente = useMemo(() => {
    const contagem = new Map<string, { total: number; preenchidos: number }>()
    for (const ind of indicadores) {
      for (const rid of respondenteIdsDoIndicador(ind.id)) {
        const atual = contagem.get(rid) ?? { total: 0, preenchidos: 0 }
        atual.total++
        if (STATUS_PREENCHIDO.includes(ind.status)) atual.preenchidos++
        contagem.set(rid, atual)
      }
    }
    const maxTotal = Math.max(1, ...Array.from(contagem.values()).map((c) => c.total))
    return Array.from(contagem.entries())
      .map(([id, c]) => ({ nome: respondenteNomePorId.get(id) ?? '—', maxTotal, ...c }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicadores, respondenteIdsDoIndicador, respondenteNomePorId])

  const resumoPorCapitulo = useMemo(() => {
    return capitulos.map((cap) => {
      const doCapitulo = indicadorIdsDoCapitulo(cap.id)
        .map((id) => indicadores.find((i) => i.id === id))
        .filter((i): i is NonNullable<typeof i> => !!i)
      const preenchidos = doCapitulo.filter((i) => STATUS_PREENCHIDO.includes(i.status)).length
      return { nome: cap.nome, total: doCapitulo.length, preenchidos }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capitulos, indicadores, indicadorIdsDoCapitulo])

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
        <h1 className="text-2xl font-extrabold text-navy-950">Central da Coleta de Indicadores</h1>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={14} /> Progresso por capítulo do relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-3">
          {resumoPorCapitulo.length === 0 ? (
            <p className="text-sm text-navy-700/60">
              Nenhum capítulo cadastrado ainda — cadastre em Relatório.
            </p>
          ) : (
            resumoPorCapitulo.map((c) => (
              <div key={c.nome}>
                <div className="mb-1 flex justify-between text-xs font-semibold text-navy-950">
                  <span>{c.nome}</span>
                  <span className="text-navy-700/60">
                    {c.preenchidos}/{c.total}
                  </span>
                </div>
                <ProgressBar value={c.total ? (c.preenchidos / c.total) * 100 : 0} className="h-1.5" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={14} /> Indicadores por respondente
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-3">
            {resumoPorRespondente.length === 0 ? (
              <p className="text-sm text-navy-700/60">Nenhum respondente com indicador atribuído ainda.</p>
            ) : (
              resumoPorRespondente.map((r) => (
                <div key={r.nome}>
                  <div className="mb-1 flex justify-between text-xs font-semibold text-navy-950">
                    <span>{r.nome}</span>
                    <span className="text-navy-700/60">
                      {r.total} indicador{r.total === 1 ? '' : 'es'} · {r.preenchidos} preenchido
                      {r.preenchidos === 1 ? '' : 's'}
                    </span>
                  </div>
                  <ProgressBar value={(r.total / r.maxTotal) * 100} className="h-1.5" />
                </div>
              ))
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
            <p className="text-sm font-semibold text-navy-950">GRI</p>
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
