import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ClipboardList, X, LayoutGrid, List } from 'lucide-react'
import { useIndicadores } from '@/hooks/useIndicadores'
import { useAreas } from '@/hooks/useAreas'
import { useRespondentes } from '@/hooks/useRespondentes'
import { useIndicadorRespondentes } from '@/hooks/useIndicadorRespondentes'
import { useCapitulos } from '@/hooks/useCapitulos'
import { useIndicadorCapitulos } from '@/hooks/useIndicadorCapitulos'
import { useTemasMateriais } from '@/hooks/useTemasMateriais'
import { useIndicadorTemasMateriais } from '@/hooks/useIndicadorTemasMateriais'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PillarBadge } from '@/components/domain/PillarBadge'
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/domain'
import { IndicadorResumo } from '@/features/indicadores/IndicadorResumo'
import { IndicadorOperacional } from '@/features/indicadores/IndicadorOperacional'
import { cn } from '@/lib/utils'
import type { Indicador, StatusIndicador } from '@/types/db'

type CategoriaNorma = 'universais' | 'setoriais' | 'tematicas'

const CATEGORIA_ORDER: CategoriaNorma[] = ['universais', 'setoriais', 'tematicas']

const CATEGORIA_INFO: Record<CategoriaNorma, { nome: string; legenda: string }> = {
  universais: { nome: 'Normas Universais', legenda: 'Aplique todas as três Normas Universais em seu relato.' },
  setoriais: { nome: 'Normas Setoriais', legenda: 'Use as Normas Setoriais que se aplicarem ao seu setor.' },
  tematicas: {
    nome: 'Normas Temáticas',
    legenda: 'Selecione Normas Temáticas para relatar informações específicas aos seus temas materiais.',
  },
}

function prefixoNumerico(codigoGri: string): number {
  const n = parseInt(codigoGri.split('-')[0], 10)
  return Number.isNaN(n) ? 0 : n
}

function sufixoNumerico(codigoGri: string): number {
  const n = parseInt(codigoGri.split('-')[1] ?? '0', 10)
  return Number.isNaN(n) ? 0 : n
}

function categoriaDoCodigo(codigoGri: string): CategoriaNorma {
  const prefixo = prefixoNumerico(codigoGri)
  if (prefixo <= 3) return 'universais'
  if (prefixo >= 11 && prefixo <= 19) return 'setoriais'
  return 'tematicas'
}

export function IndicadoresPage() {
  const { indicadores, loading, updateIndicador } = useIndicadores()
  const { areas } = useAreas()
  const { respondentes } = useRespondentes()
  const { respondenteIdsDoIndicador } = useIndicadorRespondentes()
  const { capitulos } = useCapitulos()
  const { capituloIdsDoIndicador, definirCapitulos } = useIndicadorCapitulos()
  const { temas } = useTemasMateriais()
  const { temaIdsDoIndicador, definirTemas } = useIndicadorTemasMateriais()

  const [searchParams] = useSearchParams()
  const statusInicial = (searchParams.get('status') as StatusIndicador | null) ?? ''

  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusIndicador | ''>(statusInicial)
  const [filtroRespondente, setFiltroRespondente] = useState('')
  const [filtroGri, setFiltroGri] = useState('')

  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)
  const [modo, setModo] = useState<'resumo' | 'editar'>('resumo')

  const [visao, setVisao] = useState<'normas' | 'lista'>(statusInicial ? 'lista' : 'normas')
  const [normaSelecionada, setNormaSelecionada] = useState<number | null>(null)

  const areaNomePorId = useMemo(() => new Map(areas.map((a) => [a.id, a.nome])), [areas])
  const respondenteNomePorId = useMemo(() => new Map(respondentes.map((r) => [r.id, r.nome])), [respondentes])

  const filtrados = useMemo(() => {
    return indicadores.filter((ind) => {
      if (filtroArea && ind.area_id !== filtroArea) return false
      if (filtroStatus && ind.status !== filtroStatus) return false
      if (filtroRespondente && !respondenteIdsDoIndicador(ind.id).includes(filtroRespondente)) return false
      if (filtroGri && !ind.codigo_gri.toLowerCase().includes(filtroGri.toLowerCase())) return false
      if (busca) {
        const alvo = `${ind.codigo_gri} ${ind.titulo}`.toLowerCase()
        if (!alvo.includes(busca.toLowerCase())) return false
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicadores, filtroArea, filtroStatus, filtroRespondente, filtroGri, busca, respondenteIdsDoIndicador])

  const porCategoria = useMemo(() => {
    const mapa: Record<CategoriaNorma, Map<number, Indicador[]>> = {
      universais: new Map(),
      setoriais: new Map(),
      tematicas: new Map(),
    }
    for (const ind of filtrados) {
      const categoria = categoriaDoCodigo(ind.codigo_gri)
      const norma = prefixoNumerico(ind.codigo_gri)
      if (!mapa[categoria].has(norma)) mapa[categoria].set(norma, [])
      mapa[categoria].get(norma)!.push(ind)
    }
    for (const mapaNormas of Object.values(mapa)) {
      for (const itens of mapaNormas.values()) {
        itens.sort((a, b) => sufixoNumerico(a.codigo_gri) - sufixoNumerico(b.codigo_gri))
      }
    }
    return mapa
  }, [filtrados])

  function abrirResumo(id: string) {
    setSelecionadoId(id)
    setModo('resumo')
  }

  useEffect(() => {
    const abrirId = searchParams.get('abrir')
    if (!abrirId) return
    const ind = indicadores.find((i) => i.id === abrirId)
    if (ind) abrirResumo(ind.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, indicadores])

  async function toggleEstruturaCapitulo(indicadorId: string, capituloId: string) {
    const atual = capituloIdsDoIndicador(indicadorId)
    const next = atual.includes(capituloId) ? atual.filter((x) => x !== capituloId) : [...atual, capituloId]
    await definirCapitulos(indicadorId, next)
  }

  async function toggleEstruturaTema(indicadorId: string, temaId: string) {
    const atual = temaIdsDoIndicador(indicadorId)
    const next = atual.includes(temaId) ? atual.filter((x) => x !== temaId) : [...atual, temaId]
    await definirTemas(indicadorId, next)
  }

  const indicadorSelecionado = selecionadoId ? indicadores.find((i) => i.id === selecionadoId) ?? null : null
  const semDados = !loading && indicadores.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">GRI</h1>
          <p className="text-sm text-navy-700/70">
            {indicadores.length} indicador{indicadores.length === 1 ? '' : 'es'} GRI no total
          </p>
        </div>
        <div className="flex rounded-lg border border-navy-100 p-0.5">
          <button
            onClick={() => setVisao('normas')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              visao === 'normas' ? 'bg-navy-900 text-white' : 'text-navy-700 hover:bg-navy-50',
            )}
          >
            <LayoutGrid size={14} /> Por normas GRI
          </button>
          <button
            onClick={() => setVisao('lista')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              visao === 'lista' ? 'bg-navy-900 text-white' : 'text-navy-700 hover:bg-navy-50',
            )}
          >
            <List size={14} /> Lista
          </button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-700/40" size={16} />
            <Input
              placeholder="Buscar por título ou código..."
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
          </Select>
          <Select value={filtroRespondente} onChange={(e) => setFiltroRespondente(e.target.value)}>
            <option value="">Todos os respondentes</option>
            {respondentes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </Select>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as StatusIndicador | '')}>
            <option value="">Todos os status</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-3 max-w-xs">
          <Input
            placeholder="Filtrar por código GRI (ex: 403)"
            value={filtroGri}
            onChange={(e) => setFiltroGri(e.target.value)}
          />
        </div>
      </Card>

      {semDados ? (
        <EmptyState
          icon={<ClipboardList size={32} />}
          title="Nenhum indicador cadastrado ainda"
          description="Cadastre os indicadores GRI (código, título e cronograma) na aba Configurações."
          action={
            <Link to="/configuracoes">
              <Button>Ir para Configurações</Button>
            </Link>
          }
        />
      ) : filtrados.length === 0 ? (
        <EmptyState title="Nenhum indicador corresponde aos filtros" description="Tente ajustar os filtros aplicados." />
      ) : indicadorSelecionado && modo === 'resumo' ? (
        <IndicadorResumo
          indicador={indicadorSelecionado}
          areaNome={indicadorSelecionado.area_id ? areaNomePorId.get(indicadorSelecionado.area_id) ?? null : null}
          respondentesGerais={respondentes.filter((r) =>
            respondenteIdsDoIndicador(indicadorSelecionado.id).includes(r.id),
          )}
          respondentesPorId={respondenteNomePorId}
          capitulosVinculados={capitulos.filter((c) =>
            capituloIdsDoIndicador(indicadorSelecionado.id).includes(c.id),
          )}
          temasVinculados={temas.filter((t) => temaIdsDoIndicador(indicadorSelecionado.id).includes(t.id))}
          onEditar={() => setModo('editar')}
          onFechar={() => setSelecionadoId(null)}
        />
      ) : indicadorSelecionado ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <Card className="flex max-h-[75vh] flex-col gap-1 overflow-y-auto p-2">
            {filtrados.map((ind) => {
              const ativo = ind.id === indicadorSelecionado.id
              return (
                <button
                  key={ind.id}
                  onClick={() => setSelecionadoId(ind.id)}
                  className={cn(
                    'flex flex-col gap-1 rounded-lg border-l-4 px-2.5 py-2 text-left text-sm transition-colors',
                    ativo ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-navy-50',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-navy-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                      {ind.codigo_gri}
                    </span>
                    <StatusBadge status={ind.status} />
                  </div>
                  <span className="font-medium text-navy-950">{ind.titulo}</span>
                </button>
              )
            })}
          </Card>
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-navy-100 pb-4">
              <div>
                <p className="font-mono text-xs font-semibold text-navy-700/60">{indicadorSelecionado.codigo_gri}</p>
                <h2 className="text-lg font-bold text-navy-950">{indicadorSelecionado.titulo}</h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setModo('resumo')}>
                  Ver resumo
                </Button>
                <button
                  onClick={() => setSelecionadoId(null)}
                  className="rounded-md p-1.5 text-navy-700/60 hover:bg-navy-50 hover:text-navy-950"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <IndicadorOperacional
              indicador={indicadorSelecionado}
              respondentesDoIndicador={respondentes.filter((r) =>
                respondenteIdsDoIndicador(indicadorSelecionado.id).includes(r.id),
              )}
              capitulos={capitulos}
              capituloIdsSelecionados={capituloIdsDoIndicador(indicadorSelecionado.id)}
              onToggleCapitulo={(capituloId) => toggleEstruturaCapitulo(indicadorSelecionado.id, capituloId)}
              temas={temas}
              temaIdsSelecionados={temaIdsDoIndicador(indicadorSelecionado.id)}
              onToggleTema={(temaId) => toggleEstruturaTema(indicadorSelecionado.id, temaId)}
              onStatusChange={(status) => updateIndicador(indicadorSelecionado.id, { status })}
            />
          </Card>
        </div>
      ) : visao === 'normas' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATEGORIA_ORDER.map((categoria) => {
            const normas = porCategoria[categoria]
            const totalCategoria = Array.from(normas.values()).reduce((acc, itens) => acc + itens.length, 0)
            const normasOrdenadas = Array.from(normas.keys()).sort((a, b) => a - b)

            return (
              <Card key={categoria} className="flex flex-col p-4">
                <p className="text-sm font-bold text-navy-950">{CATEGORIA_INFO[categoria].nome}</p>
                <p className="mb-1 text-xs text-navy-700/60">
                  {totalCategoria} indicador{totalCategoria === 1 ? '' : 'es'} · {normas.size} norma
                  {normas.size === 1 ? '' : 's'}
                </p>
                <p className="mb-3 text-xs text-navy-700/60">{CATEGORIA_INFO[categoria].legenda}</p>

                {normasOrdenadas.length === 0 ? (
                  <p className="text-sm text-navy-700/60">Nenhum indicador nesta categoria ainda.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {normasOrdenadas.map((norma) => {
                      const itens = normas.get(norma)!
                      const selecionada = normaSelecionada === norma
                      return (
                        <button
                          key={norma}
                          onClick={() => setNormaSelecionada(selecionada ? null : norma)}
                          className={cn(
                            'rounded-lg border p-3 text-left transition-colors',
                            selecionada ? 'border-orange-500 bg-orange-50' : 'border-navy-100 hover:bg-navy-50',
                          )}
                        >
                          <p className="font-mono text-sm font-bold text-navy-950">GRI {norma}</p>
                          <p className="text-xs text-navy-700/60">
                            {itens.length} indicador{itens.length === 1 ? '' : 'es'}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}

                {normaSelecionada !== null && normas.has(normaSelecionada) && (
                  <div className="mt-4 flex flex-col gap-1.5 border-t border-navy-100 pt-4">
                    {normas.get(normaSelecionada)!.map((ind) => (
                      <div
                        key={ind.id}
                        onClick={() => abrirResumo(ind.id)}
                        className="flex cursor-pointer flex-col gap-1 rounded-lg bg-navy-50 px-3 py-2 text-sm hover:bg-navy-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-navy-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                            {ind.codigo_gri}
                          </span>
                          <span className="font-medium text-navy-950">{ind.titulo}</span>
                        </div>
                        <StatusBadge status={ind.status} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-navy-50 text-xs font-semibold uppercase text-navy-700/70">
              <tr>
                <th className="px-3 py-3">Código</th>
                <th className="px-3 py-3">Título</th>
                <th className="px-3 py-3">Área</th>
                <th className="px-3 py-3">Respondentes</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {filtrados.map((ind) => {
                const nomesRespondentes = respondenteIdsDoIndicador(ind.id)
                  .map((id) => respondenteNomePorId.get(id))
                  .filter(Boolean)
                  .join(', ')
                return (
                  <tr key={ind.id} onClick={() => abrirResumo(ind.id)} className="cursor-pointer hover:bg-navy-50/50">
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-1">
                        <span className="w-fit rounded-md bg-navy-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                          {ind.codigo_gri}
                        </span>
                        <PillarBadge pilar={ind.pilar} />
                      </div>
                    </td>
                    <td className="max-w-xs px-3 py-2.5 font-medium text-navy-950">{ind.titulo}</td>
                    <td className="px-3 py-2.5 text-navy-700/80">
                      {ind.area_id ? areaNomePorId.get(ind.area_id) ?? '—' : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-navy-700/80">{nomesRespondentes || '—'}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={ind.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
