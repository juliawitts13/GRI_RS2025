import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Trash2, Pencil, Mic, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useEntrevistas } from '@/hooks/useEntrevistas'
import { useEntrevistaCapitulos } from '@/hooks/useEntrevistaCapitulos'
import { useCapitulos } from '@/hooks/useCapitulos'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { STATUS_ENTREVISTA_COLOR, STATUS_ENTREVISTA_LABEL, STATUS_ENTREVISTA_ORDER } from '@/lib/domain'
import { formatarDataBr } from '@/lib/progress'
import { cn } from '@/lib/utils'
import type { Entrevista, StatusEntrevista } from '@/types/db'
import type { EntrevistaInput } from '@/hooks/useEntrevistas'

const EMPTY: EntrevistaInput = {
  nome: '',
  cargo: null,
  status: 'pendente',
  data_agendada: null,
  data_realizacao: null,
  notas: null,
}

function EntrevistaStatusBadge({ status }: { status: StatusEntrevista }) {
  const c = STATUS_ENTREVISTA_COLOR[status]
  return (
    <Badge className={cn(c.bg, c.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {STATUS_ENTREVISTA_LABEL[status]}
    </Badge>
  )
}

export function EntrevistasPage() {
  const { entrevistas, loading, createEntrevista, updateEntrevista, deleteEntrevista } = useEntrevistas()
  const { capituloIdsDaEntrevista, definirCapitulosDaEntrevista } = useEntrevistaCapitulos()
  const { capitulos } = useCapitulos()

  const [searchParams] = useSearchParams()
  const [filtroStatus, setFiltroStatus] = useState<StatusEntrevista | ''>(
    (searchParams.get('status') as StatusEntrevista | null) ?? '',
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Entrevista | null>(null)
  const [form, setForm] = useState<EntrevistaInput>(EMPTY)
  const [capituloIds, setCapituloIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)

  const capituloNomePorId = useMemo(() => new Map(capitulos.map((c) => [c.id, c.nome])), [capitulos])

  const contagem = useMemo(() => {
    const base: Record<StatusEntrevista, number> = { pendente: 0, agendada: 0, realizada: 0 }
    for (const e of entrevistas) base[e.status]++
    return base
  }, [entrevistas])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setCapituloIds([])
    setDialogOpen(true)
  }

  function openEdit(e: Entrevista) {
    setEditing(e)
    setForm({
      nome: e.nome,
      cargo: e.cargo,
      status: e.status,
      data_agendada: e.data_agendada,
      data_realizacao: e.data_realizacao,
      notas: e.notas,
    })
    setCapituloIds(capituloIdsDaEntrevista(e.id))
    setDialogOpen(true)
  }

  function toggleCapitulo(id: string) {
    setCapituloIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSave() {
    if (!form.nome.trim()) return
    setSaving(true)
    if (editing) {
      await updateEntrevista(editing.id, form)
      await definirCapitulosDaEntrevista(editing.id, capituloIds)
    } else {
      const { entrevista } = await createEntrevista(form)
      if (entrevista) await definirCapitulosDaEntrevista(entrevista.id, capituloIds)
    }
    setSaving(false)
    setDialogOpen(false)
  }

  const entrevistasFiltradas = filtroStatus ? entrevistas.filter((e) => e.status === filtroStatus) : entrevistas
  const semDados = !loading && entrevistas.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Entrevistas</h1>
          <p className="text-sm text-navy-700/70">
            Entrevistas com executivos, cruzadas com os capítulos do relatório aos quais se relacionam.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Nova entrevista
        </Button>
      </div>

      {!semDados && (
        <div className="grid grid-cols-3 gap-3">
          {STATUS_ENTREVISTA_ORDER.map((s) => (
            <button key={s} onClick={() => setFiltroStatus(filtroStatus === s ? '' : s)} className="text-left">
              <Card
                className={cn(
                  'p-4 transition-shadow hover:shadow-md',
                  filtroStatus === s && 'ring-2 ring-orange-500',
                )}
              >
                <p className={cn('mb-1 h-1.5 w-8 rounded-full', STATUS_ENTREVISTA_COLOR[s].dot)} />
                <p className="text-2xl font-extrabold text-navy-950">{contagem[s]}</p>
                <p className="text-xs font-semibold text-navy-700/70">{STATUS_ENTREVISTA_LABEL[s]}</p>
              </Card>
            </button>
          ))}
        </div>
      )}

      {filtroStatus && (
        <div className="flex items-center gap-2 text-sm text-navy-700/70">
          Filtrando por: <Badge className="bg-navy-100 text-navy-900">{STATUS_ENTREVISTA_LABEL[filtroStatus]}</Badge>
          <button onClick={() => setFiltroStatus('')} className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline">
            <X size={13} /> Limpar filtro
          </button>
        </div>
      )}

      {semDados ? (
        <EmptyState
          icon={<Mic size={32} />}
          title="Nenhuma entrevista cadastrada"
          description="Cadastre as entrevistas com executivos e classifique a quais capítulos do relatório elas se relacionam."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} /> Cadastrar entrevista
            </Button>
          }
        />
      ) : entrevistasFiltradas.length === 0 ? (
        <EmptyState title="Nenhuma entrevista com esse status" description="Tente limpar o filtro aplicado." />
      ) : (
        <div className="flex flex-col gap-3">
          {entrevistasFiltradas.map((e) => {
            const idsCapitulos = capituloIdsDaEntrevista(e.id)
            const aberto = expandido === e.id

            return (
              <Card key={e.id} className="overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandido(aberto ? null : e.id)}
                  onKeyDown={(ev) => ev.key === 'Enter' && setExpandido(aberto ? null : e.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-navy-950">{e.nome}</span>
                      {e.cargo && <span className="text-xs text-navy-700/60">{e.cargo}</span>}
                      <EntrevistaStatusBadge status={e.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-navy-700/60">
                      {e.status === 'agendada' && e.data_agendada && <span>Agendada para {formatarDataBr(e.data_agendada)}</span>}
                      {e.status === 'realizada' && e.data_realizacao && <span>Realizada em {formatarDataBr(e.data_realizacao)}</span>}
                      {idsCapitulos.map((cid) => (
                        <span key={cid} className="rounded-full bg-navy-100 px-2 py-0.5 font-semibold text-navy-900">
                          {capituloNomePorId.get(cid) ?? '—'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation()
                        openEdit(e)
                      }}
                      className="rounded-md p-1.5 text-navy-700 hover:bg-navy-100"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation()
                        deleteEntrevista(e.id)
                      }}
                      className="rounded-md p-1.5 text-pillar-social hover:bg-pillar-social-100"
                    >
                      <Trash2 size={15} />
                    </button>
                    {aberto ? <ChevronUp size={18} className="text-navy-700/50" /> : <ChevronDown size={18} className="text-navy-700/50" />}
                  </div>
                </div>

                {aberto && e.notas && (
                  <div className="border-t border-navy-100 px-4 pb-4 pt-3">
                    <p className="text-sm text-navy-950">{e.notas}</p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle>{editing ? editing.nome : 'Nova entrevista'}</DialogTitle>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome-entrevista">Nome do executivo</Label>
            <Input
              id="nome-entrevista"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="ex: Maria Silva"
            />
          </div>
          <div>
            <Label htmlFor="cargo-entrevista">Cargo (opcional)</Label>
            <Input
              id="cargo-entrevista"
              value={form.cargo ?? ''}
              onChange={(e) => setForm({ ...form, cargo: e.target.value || null })}
              placeholder="ex: Diretora Financeira"
            />
          </div>
          <div>
            <Label htmlFor="status-entrevista">Status</Label>
            <Select
              id="status-entrevista"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as StatusEntrevista })}
            >
              {STATUS_ENTREVISTA_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_ENTREVISTA_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="data-agendada">Data agendada</Label>
              <Input
                id="data-agendada"
                type="date"
                value={form.data_agendada ?? ''}
                onChange={(e) => setForm({ ...form, data_agendada: e.target.value || null })}
              />
            </div>
            <div>
              <Label htmlFor="data-realizacao">Data de realização</Label>
              <Input
                id="data-realizacao"
                type="date"
                value={form.data_realizacao ?? ''}
                onChange={(e) => setForm({ ...form, data_realizacao: e.target.value || null })}
              />
            </div>
          </div>
          <div>
            <Label>Capítulos do relatório (pode selecionar mais de um)</Label>
            {capitulos.length === 0 ? (
              <p className="text-sm text-navy-700/60">Nenhum capítulo cadastrado ainda.</p>
            ) : (
              <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-navy-100 p-2.5">
                {capitulos.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-navy-950">
                    <input type="checkbox" checked={capituloIds.includes(c.id)} onChange={() => toggleCapitulo(c.id)} />
                    {c.nome}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="notas-entrevista">Notas (opcional)</Label>
            <Textarea
              id="notas-entrevista"
              rows={3}
              value={form.notas ?? ''}
              onChange={(e) => setForm({ ...form, notas: e.target.value || null })}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="mt-1">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
