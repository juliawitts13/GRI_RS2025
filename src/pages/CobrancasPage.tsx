import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useIndicadores } from '@/hooks/useIndicadores'
import { useAreas } from '@/hooks/useAreas'
import { useRespondentes } from '@/hooks/useRespondentes'
import { useIndicadorRespondentes } from '@/hooks/useIndicadorRespondentes'
import { useComentarios } from '@/hooks/useComentarios'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { AreaCobrancaDialog } from '@/features/cobrancas/AreaCobrancaDialog'
import { formatarDataBr, hojeISO } from '@/lib/progress'
import { cn } from '@/lib/utils'
import type { Area } from '@/types/db'

export function CobrancasPage() {
  const { indicadores } = useIndicadores()
  const { areas } = useAreas()
  const { respondentes } = useRespondentes()
  const { respondenteIdsDoIndicador } = useIndicadorRespondentes()
  const { comentarios, addComentario, deleteComentario } = useComentarios()

  const [areaAberta, setAreaAberta] = useState<Area | null>(null)

  const respondenteNomePorId = useMemo(() => new Map(respondentes.map((r) => [r.id, r.nome])), [respondentes])
  const hoje = hojeISO()

  const linhas = useMemo(() => {
    const base = areas.map((a) => {
      const inds = indicadores.filter((i) => i.area_id === a.id)
      return { area: a, inds }
    })

    const semAreaInds = indicadores.filter((i) => !i.area_id)
    const grupos =
      semAreaInds.length > 0
        ? [...base, { area: { id: '__sem_area__', nome: 'Sem área definida', validador_id: null, created_at: '' }, inds: semAreaInds }]
        : base

    return grupos
      .map(({ area, inds }) => {
        const pendentes = inds.filter((i) => i.status !== 'concluido')
        const atrasados = pendentes.filter(
          (i) => i.prazo && i.prazo < hoje && i.status !== 'aguardando_validacao',
        )
        const idsInds = new Set(inds.map((i) => i.id))
        const comentariosArea = comentarios.filter((c) => idsInds.has(c.indicador_id))
        const ultimaData = comentariosArea[0]?.data ?? null
        return {
          area,
          total: inds.length,
          pendentes: pendentes.length,
          atrasados: atrasados.length,
          ultimaData,
          comentariosArea,
          inds,
        }
      })
      .filter((l) => l.total > 0)
      .sort((a, b) => b.atrasados - a.atrasados || b.pendentes - a.pendentes)
  }, [areas, indicadores, comentarios, hoje])

  const areaAbertaDados = linhas.find((l) => l.area.id === areaAberta?.id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Cobranças por área</h1>
        <p className="text-sm text-navy-700/70">
          Acompanhe pendências e o histórico de cobrança de cada área. Clique numa área para ver os detalhes e
          registrar uma nova cobrança.
        </p>
      </div>

      {linhas.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle size={32} />}
          title="Nada para cobrar por aqui"
          description="Assim que houver indicadores atribuídos a áreas, o painel de cobranças aparece aqui."
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs font-semibold uppercase text-navy-700/70">
              <tr>
                <th className="px-5 py-3">Área</th>
                <th className="px-5 py-3">Atrasados</th>
                <th className="px-5 py-3">Pendentes</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Última cobrança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {linhas.map((l) => (
                <tr
                  key={l.area.id}
                  onClick={() => setAreaAberta(l.area)}
                  className="cursor-pointer hover:bg-navy-50/50"
                >
                  <td className="px-5 py-3 font-semibold text-navy-950">{l.area.nome}</td>
                  <td className="px-5 py-3">
                    {l.atrasados > 0 ? (
                      <Badge className="bg-pillar-social-100 text-pillar-social">{l.atrasados} atrasado{l.atrasados === 1 ? '' : 's'}</Badge>
                    ) : (
                      <span className="text-navy-700/50">—</span>
                    )}
                  </td>
                  <td className={cn('px-5 py-3', l.pendentes > 0 ? 'text-navy-950 font-medium' : 'text-navy-700/60')}>
                    {l.pendentes}
                  </td>
                  <td className="px-5 py-3 text-navy-700/70">{l.total}</td>
                  <td className="px-5 py-3 text-navy-700/70">
                    {l.ultimaData ? formatarDataBr(l.ultimaData) : 'Nunca registrada'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <AreaCobrancaDialog
        open={!!areaAberta}
        onOpenChange={(o) => !o && setAreaAberta(null)}
        area={areaAberta}
        indicadoresDaArea={areaAbertaDados?.inds ?? []}
        comentariosDaArea={areaAbertaDados?.comentariosArea ?? []}
        respondenteIdsDoIndicador={respondenteIdsDoIndicador}
        respondenteNomePorId={respondenteNomePorId}
        validadorNome={
          areaAberta?.validador_id ? respondenteNomePorId.get(areaAberta.validador_id) ?? null : null
        }
        addComentario={addComentario}
        deleteComentario={deleteComentario}
      />
    </div>
  )
}
