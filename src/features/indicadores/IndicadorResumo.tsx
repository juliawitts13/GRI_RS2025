import { Check, Circle, Pencil, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PillarBadge } from '@/components/domain/PillarBadge'
import { formatarDataBr } from '@/lib/progress'
import { useIndicadorComentarios } from '@/hooks/useIndicadorComentarios'
import { useIndicadorPerguntas } from '@/hooks/useIndicadorPerguntas'
import { cn } from '@/lib/utils'
import type { Capitulo, Indicador, Respondente, TemaMaterial } from '@/types/db'

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-700/50">{rotulo}</p>
      <p className="text-sm font-medium text-navy-950">{valor}</p>
    </div>
  )
}

export function IndicadorResumo({
  indicador,
  areaNome,
  respondentesGerais,
  respondentesPorId,
  capitulosVinculados,
  temasVinculados,
  onEditar,
  onFechar,
}: {
  indicador: Indicador
  areaNome: string | null
  respondentesGerais: Respondente[]
  respondentesPorId: Map<string, string>
  capitulosVinculados: Capitulo[]
  temasVinculados: TemaMaterial[]
  onEditar: () => void
  onFechar: () => void
}) {
  const { perguntas } = useIndicadorPerguntas(indicador.id)
  const { comentarios } = useIndicadorComentarios(indicador.id)

  const respondidas = perguntas.filter((p) => p.respondida).length

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-navy-100 pb-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-md bg-navy-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
              {indicador.codigo_gri}
            </span>
            <PillarBadge pilar={indicador.pilar} />
          </div>
          <h2 className="text-lg font-bold text-navy-950">{indicador.titulo}</h2>
          <div className="mt-1">
            <StatusBadge status={indicador.status} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={onEditar}>
            <Pencil size={14} /> Editar
          </Button>
          <button onClick={onFechar} className="rounded-md p-1.5 text-navy-700/60 hover:bg-navy-50 hover:text-navy-950">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Campo rotulo="Área responsável" valor={areaNome ?? 'Sem área'} />
          <Campo rotulo="Data de entrega" valor={formatarDataBr(indicador.prazo)} />
          <Campo rotulo="Expectativa" valor={formatarDataBr(indicador.expectativa_entrega)} />
          <Campo rotulo="Vencimento" valor={formatarDataBr(indicador.vencimento)} />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700/50">Respondentes</p>
          {respondentesGerais.length === 0 ? (
            <p className="text-sm text-navy-700/60">Nenhum respondente definido.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {respondentesGerais.map((r) => (
                <span key={r.id} className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-950">
                  {r.nome}
                </span>
              ))}
            </div>
          )}
        </div>

        {indicador.ficha_conteudo && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700/50">Anotações da ficha</p>
            <p className="whitespace-pre-wrap text-sm text-navy-950">{indicador.ficha_conteudo}</p>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700/50">
            Perguntas {perguntas.length > 0 && `(${respondidas}/${perguntas.length} respondidas)`}
          </p>
          {perguntas.length === 0 ? (
            <p className="text-sm text-navy-700/60">Nenhuma pergunta cadastrada ainda.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {perguntas.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    {p.respondida ? (
                      <Check size={14} className="shrink-0 text-status-concluido" />
                    ) : (
                      <Circle size={14} className="shrink-0 text-navy-700/30" />
                    )}
                    <span className={cn('text-navy-950', p.respondida && 'text-navy-700/60 line-through')}>
                      {p.texto}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-navy-700/60">
                    {p.respondente_id ? respondentesPorId.get(p.respondente_id) ?? '—' : 'sem responsável'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700/50">
              Capítulos do relatório
            </p>
            {capitulosVinculados.length === 0 ? (
              <p className="text-sm text-navy-700/60">Nenhum capítulo vinculado.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {capitulosVinculados.map((c) => (
                  <span key={c.id} className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-950">
                    {c.nome}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700/50">Temas materiais</p>
            {temasVinculados.length === 0 ? (
              <p className="text-sm text-navy-700/60">Nenhum tema vinculado.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {temasVinculados.map((t) => (
                  <span key={t.id} className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-950">
                    {t.nome}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700/50">
            Último status no histórico de interações
          </p>
          {comentarios.length === 0 ? (
            <p className="text-sm text-navy-700/60">Nenhum registro de interação ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {comentarios.slice(0, 3).map((c) => (
                <div key={c.id} className="rounded-lg border border-navy-100 p-2.5">
                  <p className="text-xs font-semibold text-navy-700/70">{formatarDataBr(c.data)}</p>
                  <p className="text-sm text-navy-950">{c.texto}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
