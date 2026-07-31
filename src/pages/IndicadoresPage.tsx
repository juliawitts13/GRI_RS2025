import { useMemo, useState } from 'react'
import { Plus, Search, Upload, ClipboardList, Pencil, Trash2 } from 'lucide-react'
import { useIndicadores } from '@/hooks/useIndicadores'
import { useAreas } from '@/hooks/useAreas'
import { useRespondentes } from '@/hooks/useRespondentes'
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
import type { Indicador, StatusIndicador } from '@/types/db'

export function IndicadoresPage() {
  const { indicadores, loading, createIndicador, updateIndicador, deleteIndicador, upsertManyByCodigo } =
    useIndicadores()
  const { areas } = useAreas()
  const { respondentes } = useRespondentes()

  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusIndicador | ''>('')
  const [filtroRespondente, setFiltroRespondente] = useState('')
  const [filtroGri, setFiltroGri] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Indicador | null>(null)

  const areaNomePorId = useMemo(() => new Map(areas.map((a) => [a.id, a.nome])), [areas])
  const respondenteNomePorId = useMemo(() => new Map(respondentes.map((r) => [r.id, r.nome])), [respondentes])

  const filtrados = useMemo(() => {
    return indicadores.filter((ind) => {
      if (filtroArea && ind.area_id !== filtroArea) return false
      if (filtroStatus && ind.status !== filtroStatus) return false
      if (filtroRespondente && ind.respondente_id !== filtroRespondente) return false
      if (filtroGri && !ind.codigo_gri.toLowerCase().includes(filtroGri.toLowerCase())) return false
      if (busca) {
        const alvo = `${ind.codigo_gri} ${ind.titulo}`.toLowerCase()
        if (!alvo.includes(busca.toLowerCase())) return false
      }
      return true
    })
  }, [indicadores, filtroArea, filtroStatus, filtroRespondente, filtroGri, busca])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(ind: Indicador) {
    setEditing(ind)
    setFormOpen(true)
  }

  async function handleSave(input: Parameters<typeof createIndicador>[0]) {
    if (editing) {
      await updateIndicador(editing.id, input)
    } else {
      await createIndicador(input)
    }
  }

  const semDados = !loading && indicadores.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Coleta de Indicadores</h1>
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

      {semDados ? (
        <EmptyState
          icon={<ClipboardList size={32} />}
          title="Nenhum indicador cadastrado ainda"
          description="Importe a planilha de indicadores GRI (com área, respondente, status e prazo) ou cadastre um indicador manualmente."
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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtrados.map((ind) => (
            <Card key={ind.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-navy-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                      {ind.codigo_gri}
                    </span>
                    <PillarBadge pilar={ind.pilar} />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold leading-snug text-navy-950">{ind.titulo}</p>
                </div>
                <div className="flex shrink-0 gap-1">
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
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-100 pt-3 text-xs text-navy-700/80">
                <span>
                  <strong className="text-navy-950">Área:</strong>{' '}
                  {ind.area_id ? areaNomePorId.get(ind.area_id) ?? '—' : '—'}
                </span>
                <span>
                  <strong className="text-navy-950">Respondente:</strong>{' '}
                  {ind.respondente_id ? respondenteNomePorId.get(ind.respondente_id) ?? '—' : '—'}
                </span>
                <span>
                  <strong className="text-navy-950">Prazo:</strong> {formatarDataBr(ind.prazo)}
                </span>
              </div>
              <StatusBadge status={ind.status} />
            </Card>
          ))}
        </div>
      )}

      <IndicadorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        areas={areas}
        respondentes={respondentes}
        onSave={handleSave}
      />
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        areas={areas}
        respondentes={respondentes}
        onImport={async (itens) => {
          await upsertManyByCodigo(itens)
        }}
      />
    </div>
  )
}
