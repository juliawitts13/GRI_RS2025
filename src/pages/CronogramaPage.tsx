import { useMemo } from 'react'
import { useCronograma } from '@/hooks/useCronograma'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cronogramaStatusColor } from '@/lib/domain'
import { formatarDataBr } from '@/lib/progress'
import { cn } from '@/lib/utils'

export function CronogramaPage() {
  const { tarefas, loading } = useCronograma()

  const fases = useMemo(() => {
    const grupos = new Map<string, typeof tarefas>()
    for (const t of tarefas) {
      if (!grupos.has(t.fase)) grupos.set(t.fase, [])
      grupos.get(t.fase)!.push(t)
    }
    return Array.from(grupos.entries()).map(([fase, itens]) => {
      const inicios = itens.map((i) => i.data_inicio).filter(Boolean) as string[]
      const fins = itens.map((i) => i.data_fim).filter(Boolean) as string[]
      const dataInicio = inicios.sort()[0]
      const dataFim = fins.sort().at(-1)
      const hoje = new Date()
      let progresso = 0
      if (dataInicio && dataFim) {
        const ini = new Date(dataInicio).getTime()
        const fim = new Date(dataFim).getTime()
        progresso = Math.min(100, Math.max(0, Math.round(((hoje.getTime() - ini) / (fim - ini)) * 100)))
      }
      return { fase, itens, dataInicio, dataFim, progresso }
    })
  }, [tarefas])

  if (loading) return <p className="text-sm text-navy-700/70">Carregando cronograma...</p>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Cronograma</h1>
        <p className="text-sm text-navy-700/70">Linha do tempo das fases do projeto, importada do Cronograma.xlsx.</p>
      </div>

      <div className="flex flex-col gap-4">
        {fases.map(({ fase, itens, dataInicio, dataFim, progresso }) => (
          <Card key={fase} className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-navy-950">{fase}</h2>
              <span className="text-xs font-medium text-navy-700/70">
                {formatarDataBr(dataInicio)} — {formatarDataBr(dataFim)}
              </span>
            </div>
            <ProgressBar value={progresso} className="mb-4 h-2" />
            <div className="flex flex-col gap-1.5">
              {itens.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-2 py-1.5 text-sm',
                    t.nivel === 0 ? 'font-semibold text-navy-950' : 'ml-4 text-navy-700/90',
                  )}
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', cronogramaStatusColor(t.status))} />
                  <span className="flex-1">{t.tarefa}</span>
                  <span className="text-xs text-navy-700/60">
                    {formatarDataBr(t.data_inicio)} - {formatarDataBr(t.data_fim)}
                  </span>
                  {t.status && <span className="text-xs text-navy-700/50">{t.status}</span>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
