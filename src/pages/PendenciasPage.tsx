import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Building2, Search, Mic, ClipboardList, X } from 'lucide-react'
import { useIndicadores } from '@/hooks/useIndicadores'
import { useAreas } from '@/hooks/useAreas'
import { useRespondentes } from '@/hooks/useRespondentes'
import { useIndicadorRespondentes } from '@/hooks/useIndicadorRespondentes'
import { useEntrevistas } from '@/hooks/useEntrevistas'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { STATUS_ENTREVISTA_COLOR, STATUS_ENTREVISTA_LABEL } from '@/lib/domain'
import { diasAteVencer, formatarDataBr, hojeISO } from '@/lib/progress'
import { cn } from '@/lib/utils'
import type { Entrevista, Indicador } from '@/types/db'

const SEM_AREA = '__sem_area__'

function PrazoInfo({ data }: { data: string | null }) {
  if (!data) return <span className="text-xs text-navy-700/50">Sem prazo definido</span>
  const dias = diasAteVencer(data)
  if (dias !== null && dias < 0) {
    return (
      <Badge className="bg-status-devolvido/10 text-status-devolvido">
        Atrasado há {Math.abs(dias)} dia{Math.abs(dias) === 1 ? '' : 's'}
      </Badge>
    )
  }
  if (dias !== null && dias <= 7) {
    return (
      <Badge className="bg-status-em-andamento/10 text-orange-600">
        Vence em {dias} dia{dias === 1 ? '' : 's'}
      </Badge>
    )
  }
  return <span className="text-xs text-navy-700/60">Prazo: {formatarDataBr(data)}</span>
}

export function PendenciasPage() {
  const { indicadores } = useIndicadores()
  const { areas } = useAreas()
  const { respondentes } = useRespondentes()
  const { respondenteIdsDoIndicador } = useIndicadorRespondentes()
  const { entrevistas } = useEntrevistas()

  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [somenteAtrasados, setSomenteAtrasados] = useState(false)

  const areaNomePorId = useMemo(() => new Map(areas.map((a) => [a.id, a.nome])), [areas])
  const respondenteNomePorId = useMemo(() => new Map(respondentes.map((r) => [r.id, r.nome])), [respondentes])
  const hoje = hojeISO()

  const indicadorEstaAtrasado = (i: Indicador) => {
    const data = i.prazo ?? i.vencimento
    if (!data) return false
    const dias = diasAteVencer(data)
    return dias !== null && dias < 0
  }

  const entrevistaEstaAtrasada = (e: Entrevista) => e.status === 'agendada' && !!e.data_agendada && e.data_agendada < hoje

  const indicadoresPendentes = useMemo(() => {
    return indicadores.filter((i) => {
      if (i.status === 'concluido') return false
      if (filtroArea && filtroArea !== SEM_AREA && i.area_id !== filtroArea) return false
      if (filtroArea === SEM_AREA && i.area_id) return false
      if (somenteAtrasados && !indicadorEstaAtrasado(i)) return false
      if (busca) {
        const nomesResp = respondenteIdsDoIndicador(i.id)
          .map((id) => respondenteNomePorId.get(id) ?? '')
          .join(' ')
        const alvo = `${i.codigo_gri} ${i.titulo} ${nomesResp}`.toLowerCase()
        if (!alvo.includes(busca.toLowerCase())) return false
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicadores, filtroArea, somenteAtrasados, busca, respondenteIdsDoIndicador, respondenteNomePorId])

  const entrevistasPendentes = useMemo(() => {
    return entrevistas.filter((e) => {
      if (e.status === 'realizada') return false
      if (filtroArea && filtroArea !== SEM_AREA && e.area_id !== filtroArea) return false
      if (filtroArea === SEM_AREA && e.area_id) return false
      if (somenteAtrasados && !entrevistaEstaAtrasada(e)) return false
      if (busca) {
        const alvo = `${e.nome} ${e.cargo ?? ''}`.toLowerCase()
        if (!alvo.includes(busca.toLowerCase())) return false
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrevistas, filtroArea, somenteAtrasados, busca])

  const gruposIndicadores = useMemo(() => {
    const mapa = new Map<string, Indicador[]>()
    for (const i of indicadoresPendentes) {
      const key = i.area_id ?? SEM_AREA
      const atual = mapa.get(key) ?? []
      atual.push(i)
      mapa.set(key, atual)
    }
    return Array.from(mapa.entries())
      .map(([key, itens]) => ({
        key,
        nome: key === SEM_AREA ? 'Sem área definida' : areaNomePorId.get(key) ?? '—',
        itens: itens.sort((a, b) => {
          const da = a.prazo ?? a.vencimento
          const db = b.prazo ?? b.vencimento
          if (!da && !db) return 0
          if (!da) return 1
          if (!db) return -1
          return da.localeCompare(db)
        }),
      }))
      .sort((a, b) => b.itens.length - a.itens.length)
  }, [indicadoresPendentes, areaNomePorId])

  const gruposEntrevistas = useMemo(() => {
    const mapa = new Map<string, Entrevista[]>()
    for (const e of entrevistasPendentes) {
      const key = e.area_id ?? SEM_AREA
      const atual = mapa.get(key) ?? []
      atual.push(e)
      mapa.set(key, atual)
    }
    return Array.from(mapa.entries())
      .map(([key, itens]) => ({
        key,
        nome: key === SEM_AREA ? 'Sem área definida' : areaNomePorId.get(key) ?? '—',
        itens,
      }))
      .sort((a, b) => b.itens.length - a.itens.length)
  }, [entrevistasPendentes, areaNomePorId])

  const totalAtrasadosIndicadores = indicadores.filter((i) => i.status !== 'concluido' && indicadorEstaAtrasado(i)).length
  const totalAtrasadasEntrevistas = entrevistas.filter(entrevistaEstaAtrasada).length
  const totalPendentesIndicadores = indicadores.filter((i) => i.status !== 'concluido').length
  const totalPendentesEntrevistas = entrevistas.filter((e) => e.status !== 'realizada').length

  const semDados = indicadores.length === 0 && entrevistas.length === 0
  const filtroAtivo = !!busca || !!filtroArea || somenteAtrasados

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Pendências</h1>
        <p className="text-sm text-navy-700/70">
          Quem cobrar, por área — indicadores e entrevistas ainda não concluídos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="mb-1 h-1.5 w-8 rounded-full bg-navy-700/40" />
          <p className="text-2xl font-extrabold text-navy-950">{totalPendentesIndicadores}</p>
          <p className="text-xs font-semibold text-navy-700/70">Indicadores pendentes</p>
        </Card>
        <Card className="p-4">
          <p className="mb-1 h-1.5 w-8 rounded-full bg-status-devolvido" />
          <p className="text-2xl font-extrabold text-navy-950">{totalAtrasadosIndicadores}</p>
          <p className="text-xs font-semibold text-navy-700/70">Indicadores atrasados</p>
        </Card>
        <Card className="p-4">
          <p className="mb-1 h-1.5 w-8 rounded-full bg-navy-700/40" />
          <p className="text-2xl font-extrabold text-navy-950">{totalPendentesEntrevistas}</p>
          <p className="text-xs font-semibold text-navy-700/70">Entrevistas pendentes</p>
        </Card>
        <Card className="p-4">
          <p className="mb-1 h-1.5 w-8 rounded-full bg-status-devolvido" />
          <p className="text-2xl font-extrabold text-navy-950">{totalAtrasadasEntrevistas}</p>
          <p className="text-xs font-semibold text-navy-700/70">Entrevistas atrasadas</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-700/40" size={16} />
            <Input
              placeholder="Buscar por código, título ou responsável..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
            <option value="">Todas as áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
            <option value={SEM_AREA}>Sem área definida</option>
          </Select>
          <button
            onClick={() => setSomenteAtrasados((v) => !v)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
              somenteAtrasados
                ? 'border-status-devolvido bg-status-devolvido/10 text-status-devolvido'
                : 'border-navy-100 text-navy-700 hover:bg-navy-50',
            )}
          >
            <AlertCircle size={15} /> Somente atrasados
          </button>
        </div>
        {filtroAtivo && (
          <button
            onClick={() => {
              setBusca('')
              setFiltroArea('')
              setSomenteAtrasados(false)
            }}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline"
          >
            <X size={13} /> Limpar filtros
          </button>
        )}
      </Card>

      {semDados ? (
        <EmptyState
          icon={<AlertCircle size={32} />}
          title="Nada cadastrado ainda"
          description="Cadastre indicadores e entrevistas para acompanhar as pendências aqui."
        />
      ) : (
        <>
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy-700/80">
              <ClipboardList size={15} /> Indicadores pendentes por área
            </h2>
            {gruposIndicadores.length === 0 ? (
              <Card className="p-6">
                <p className="text-sm text-navy-700/60">Nenhum indicador pendente com os filtros aplicados.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {gruposIndicadores.map((grupo) => (
                  <Card key={grupo.key} className="overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-navy-100 bg-navy-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 size={15} className="text-navy-700/60" />
                        <span className="text-sm font-bold text-navy-950">{grupo.nome}</span>
                      </div>
                      <span className="text-xs font-semibold text-navy-700/60">
                        {grupo.itens.length} indicador{grupo.itens.length === 1 ? '' : 'es'}
                      </span>
                    </div>
                    <div className="divide-y divide-navy-100">
                      {grupo.itens.map((ind) => {
                        const nomesResp = respondenteIdsDoIndicador(ind.id)
                          .map((id) => respondenteNomePorId.get(id))
                          .filter(Boolean)
                        return (
                          <Link
                            key={ind.id}
                            to={`/indicadores?abrir=${ind.id}`}
                            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-navy-50/60"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <span className="shrink-0 rounded-md bg-navy-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                                {ind.codigo_gri}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-navy-950">{ind.titulo}</p>
                                <p className="truncate text-xs text-navy-700/60">
                                  {nomesResp.length > 0 ? nomesResp.join(', ') : 'Sem respondente atribuído'}
                                </p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <PrazoInfo data={ind.prazo ?? ind.vencimento} />
                              <StatusBadge status={ind.status} />
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy-700/80">
              <Mic size={15} /> Entrevistas pendentes por área
            </h2>
            {gruposEntrevistas.length === 0 ? (
              <Card className="p-6">
                <p className="text-sm text-navy-700/60">Nenhuma entrevista pendente com os filtros aplicados.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {gruposEntrevistas.map((grupo) => (
                  <Card key={grupo.key} className="overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-navy-100 bg-navy-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 size={15} className="text-navy-700/60" />
                        <span className="text-sm font-bold text-navy-950">{grupo.nome}</span>
                      </div>
                      <span className="text-xs font-semibold text-navy-700/60">
                        {grupo.itens.length} entrevista{grupo.itens.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="divide-y divide-navy-100">
                      {grupo.itens.map((e) => {
                        const c = STATUS_ENTREVISTA_COLOR[e.status]
                        const atrasada = entrevistaEstaAtrasada(e)
                        return (
                          <Link
                            key={e.id}
                            to={`/entrevistas?abrir=${e.id}`}
                            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-navy-50/60"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-navy-950">{e.nome}</p>
                              <p className="truncate text-xs text-navy-700/60">
                                {e.cargo ?? '—'}
                                {e.marca ? ` · ${e.marca}` : ''}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {atrasada && (
                                <Badge className="bg-status-devolvido/10 text-status-devolvido">
                                  Agendamento vencido
                                </Badge>
                              )}
                              {e.status === 'agendada' && e.data_agendada && !atrasada && (
                                <span className="text-xs text-navy-700/60">
                                  Agendada para {formatarDataBr(e.data_agendada)}
                                </span>
                              )}
                              <Badge className={cn(c.bg, c.text)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
                                {STATUS_ENTREVISTA_LABEL[e.status]}
                              </Badge>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
