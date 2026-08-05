import { useMemo, useState } from 'react'
import { Plus, Search, Upload, ClipboardList, Pencil, Trash2, Users, X } from 'lucide-react'
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
import { formatarDataBr } from '@/lib/progress'
import { IndicadorFormDialog } from '@/features/indicadores/IndicadorFormDialog'
import { ImportDialog } from '@/features/indicadores/ImportDialog'
import { BulkAssignDialog } from '@/features/indicadores/BulkAssignDialog'
import { cn } from '@/lib/utils'
import type { Indicador, StatusIndicador } from '@/types/db'

export function IndicadoresPage() {
  const {
    indicadores,
    loading,
    createIndicador,
    updateIndicador,
    deleteIndicador,
    upsertManyByCodigo,
    updateManyIndicadores,
  } = useIndicadores()
  const { areas } = useAreas()
  const { respondentes } = useRespondentes()
  const { respondenteIdsDoIndicador, definirRespondentes, adicionarRespondenteEmLote } = useIndicadorRespondentes()
  const { capitulos } = useCapitulos()
  const { capituloIdsDoIndicador, definirCapitulos } = useIndicadorCapitulos()
  const { temas } = useTemasMateriais()
  const { temaIdsDoIndicador, definirTemas } = useIndicadorTemasMateriais()

  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusIndicador | ''>('')
  const [filtroRespondente, setFiltroRespondente] = useState('')
  const [filtroGri, setFiltroGri] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editing, setEditing] = useState<Indicador | null>(null)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())

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

  const todosFiltradosSelecionados = filtrados.length > 0 && filtrados.every((i) => selecionados.has(i.id))

  function toggleSelecionado(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelecionarTodos() {
    setSelecionados((prev) => {
      if (todosFiltradosSelecionados) {
        const next = new Set(prev)
        for (const i of filtrados) next.delete(i.id)
        return next
      }
      const next = new Set(prev)
      for (const i of filtrados) next.add(i.id)
      return next
    })
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(ind: Indicador) {
    setEditing(ind)
    setFormOpen(true)
  }

  async function handleSave(
    input: Parameters<typeof createIndicador>[0],
    respondenteIds: string[],
    capituloIds: string[],
    temaIds: string[],
  ) {
    if (editing) {
      await updateIndicador(editing.id, input)
      await definirRespondentes(editing.id, respondenteIds)
      await definirCapitulos(editing.id, capituloIds)
      await definirTemas(editing.id, temaIds)
    } else {
      const { indicador } = await createIndicador(input)
      if (indicador) {
        await definirRespondentes(indicador.id, respondenteIds)
        await definirCapitulos(indicador.id, capituloIds)
        await definirTemas(indicador.id, temaIds)
      }
    }
  }

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload size={16} /> Importar planilha
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} /> Novo indicador
          </Button>
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

      {selecionados.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-navy-900 px-4 py-3 text-white">
          <span className="text-sm font-semibold">
            {selecionados.size} indicador{selecionados.size === 1 ? '' : 'es'} selecionado
            {selecionados.size === 1 ? '' : 's'}
          </span>
          <Button size="sm" onClick={() => setBulkOpen(true)}>
            <Users size={14} /> Atribuir em lote
          </Button>
          <button
            onClick={() => setSelecionados(new Set())}
            className="ml-auto flex items-center gap-1 text-xs font-semibold text-white/70 hover:text-white"
          >
            <X size={14} /> Limpar seleção
          </button>
        </div>
      )}

      {semDados ? (
        <EmptyState
          icon={<ClipboardList size={32} />}
          title="Nenhum indicador cadastrado ainda"
          description="Importe a planilha de indicadores GRI (com área, respondente, status e data de entrega) ou cadastre um indicador manualmente."
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload size={16} /> Importar planilha
              </Button>
              <Button onClick={openCreate}>
                <Plus size={16} /> Novo indicador
              </Button>
            </div>
          }
        />
      ) : filtrados.length === 0 ? (
        <EmptyState title="Nenhum indicador corresponde aos filtros" description="Tente ajustar os filtros aplicados." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-navy-50 text-xs font-semibold uppercase text-navy-700/70">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={todosFiltradosSelecionados}
                    onChange={toggleSelecionarTodos}
                    aria-label="Selecionar todos"
                  />
                </th>
                <th className="px-3 py-3">Código</th>
                <th className="px-3 py-3">Título</th>
                <th className="px-3 py-3">Área</th>
                <th className="px-3 py-3">Respondentes</th>
                <th className="px-3 py-3">Vencimento</th>
                <th className="px-3 py-3">Status</th>
                <th className="w-20 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {filtrados.map((ind) => {
                const nomesRespondentes = respondenteIdsDoIndicador(ind.id)
                  .map((id) => respondenteNomePorId.get(id))
                  .filter(Boolean)
                  .join(', ')
                return (
                  <tr
                    key={ind.id}
                    onClick={() => openEdit(ind)}
                    className={cn(
                      'cursor-pointer hover:bg-navy-50/50',
                      selecionados.has(ind.id) && 'bg-orange-50/60',
                    )}
                  >
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selecionados.has(ind.id)}
                        onChange={() => toggleSelecionado(ind.id)}
                        aria-label={`Selecionar ${ind.codigo_gri}`}
                      />
                    </td>
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
                    <td className="px-3 py-2.5 text-navy-700/80">{formatarDataBr(ind.vencimento)}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={ind.status} />
                    </td>
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(ind)} className="rounded-md p-1.5 text-navy-700 hover:bg-navy-100">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteIndicador(ind.id)}
                          className="rounded-md p-1.5 text-pillar-social hover:bg-pillar-social-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      <IndicadorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        areas={areas}
        respondentes={respondentes}
        respondenteIdsSelecionados={editing ? respondenteIdsDoIndicador(editing.id) : []}
        capitulos={capitulos}
        capituloIdsSelecionados={editing ? capituloIdsDoIndicador(editing.id) : []}
        temas={temas}
        temaIdsSelecionados={editing ? temaIdsDoIndicador(editing.id) : []}
        onSave={handleSave}
      />
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        areas={areas}
        respondentes={respondentes}
        onImport={async (itens) => {
          const { indicadores: salvos } = await upsertManyByCodigo(itens.map((i) => i.input))
          const idPorCodigo = new Map(salvos.map((s) => [s.codigo_gri, s.id]))
          for (const item of itens) {
            const id = idPorCodigo.get(item.input.codigo_gri)
            if (id) await definirRespondentes(id, item.respondenteIds)
          }
        }}
      />
      <BulkAssignDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        count={selecionados.size}
        areas={areas}
        respondentes={respondentes}
        onApply={async (patch, respondenteIdParaAdicionar) => {
          const ids = Array.from(selecionados)
          if (Object.keys(patch).length > 0) await updateManyIndicadores(ids, patch)
          if (respondenteIdParaAdicionar) await adicionarRespondenteEmLote(ids, respondenteIdParaAdicionar)
          setSelecionados(new Set())
        }}
      />
    </div>
  )
}
