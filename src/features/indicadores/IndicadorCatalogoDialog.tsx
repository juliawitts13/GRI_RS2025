import { useEffect, useState } from 'react'
import { Trash2, Plus, Check, X, ListChecks, Info, CalendarClock } from 'lucide-react'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/domain'
import { useIndicadorPerguntas } from '@/hooks/useIndicadorPerguntas'
import { cn } from '@/lib/utils'
import type { Area, Indicador, Respondente } from '@/types/db'
import type { IndicadorInput } from '@/hooks/useIndicadores'

const EMPTY: IndicadorInput = {
  codigo_gri: '',
  titulo: '',
  area_id: null,
  status: 'nao_iniciado',
  prazo: null,
  expectativa_entrega: null,
  vencimento: null,
  ficha_conteudo: null,
}

type Aba = 'info' | 'cronograma' | 'perguntas'

const ABAS: { key: Aba; label: string; icon: typeof Info }[] = [
  { key: 'info', label: 'Informações do Indicador', icon: Info },
  { key: 'cronograma', label: 'Cronograma', icon: CalendarClock },
  { key: 'perguntas', label: 'Perguntas', icon: ListChecks },
]

function PerguntasCatalogo({ indicadorId }: { indicadorId: string }) {
  const { perguntas, addPergunta, updatePergunta, deletePergunta } = useIndicadorPerguntas(indicadorId)
  const [nova, setNova] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTexto, setEditingTexto] = useState('')

  async function handleAdd() {
    if (!nova.trim()) return
    await addPergunta(nova.trim())
    setNova('')
  }

  function startEdit(id: string, texto: string) {
    setEditingId(id)
    setEditingTexto(texto)
  }

  async function saveEdit() {
    if (editingId && editingTexto.trim()) await updatePergunta(editingId, { texto: editingTexto.trim() })
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <Label className="flex items-center gap-1.5">
        <ListChecks size={13} /> Perguntas do relatório
      </Label>
      <p className="-mt-1 text-xs text-navy-700/60">
        Defina aqui o texto de cada pergunta. Marcar quem responde e o que já foi respondido é feito na aba GRI.
      </p>

      <div className="flex flex-col gap-1.5">
        {perguntas.map((p) =>
          editingId === p.id ? (
            <div key={p.id} className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={editingTexto}
                onChange={(e) => setEditingTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit()
                  if (e.key === 'Escape') setEditingId(null)
                }}
                className="text-sm"
              />
              <button onClick={saveEdit} className="shrink-0 rounded-md p-1.5 text-status-concluido hover:bg-status-concluido/10">
                <Check size={15} />
              </button>
              <button onClick={() => setEditingId(null)} className="shrink-0 rounded-md p-1.5 text-navy-700 hover:bg-navy-100">
                <X size={15} />
              </button>
            </div>
          ) : (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm"
            >
              <span onClick={() => startEdit(p.id, p.texto)} className="flex-1 cursor-pointer text-navy-950 hover:underline">
                {p.texto}
              </span>
              <button
                onClick={() => deletePergunta(p.id)}
                className="shrink-0 rounded-md p-1 text-pillar-social hover:bg-pillar-social-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ),
        )}
        {perguntas.length === 0 && <p className="text-sm text-navy-700/60">Nenhuma pergunta adicionada ainda.</p>}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="ex: Já temos os dados de emissões consolidados?"
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="text-sm"
        />
        <Button size="sm" variant="outline" onClick={handleAdd} disabled={!nova.trim()}>
          <Plus size={14} /> Adicionar
        </Button>
      </div>
    </div>
  )
}

export function IndicadorCatalogoForm({
  editing,
  areas,
  respondentes,
  respondenteIdsSelecionados,
  onSave,
  onSaved,
}: {
  editing: Indicador | null
  areas: Area[]
  respondentes: Respondente[]
  respondenteIdsSelecionados: string[]
  onSave: (input: IndicadorInput, respondenteIds: string[]) => Promise<void>
  onSaved?: () => void
}) {
  const [form, setForm] = useState<IndicadorInput>(EMPTY)
  const [respondenteIds, setRespondenteIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [aba, setAba] = useState<Aba>('info')

  useEffect(() => {
    if (editing) {
      setForm({
        codigo_gri: editing.codigo_gri,
        titulo: editing.titulo,
        area_id: editing.area_id,
        status: editing.status,
        prazo: editing.prazo,
        expectativa_entrega: editing.expectativa_entrega,
        vencimento: editing.vencimento,
        ficha_conteudo: editing.ficha_conteudo,
      })
    } else {
      setForm(EMPTY)
    }
    setRespondenteIds(respondenteIdsSelecionados)
    setAba('info')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const respondentesElegiveis = respondentes.filter((r) => r.eh_respondente)
  const respondentesDaArea = form.area_id
    ? respondentesElegiveis.filter((r) => r.area_id === form.area_id)
    : respondentesElegiveis

  function toggleRespondente(id: string) {
    setRespondenteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSave() {
    if (!form.codigo_gri.trim() || !form.titulo.trim()) return
    setSaving(true)
    await onSave(form, respondenteIds)
    setSaving(false)
    onSaved?.()
  }

  const abasVisiveis = editing ? ABAS : ABAS.filter((a) => a.key !== 'perguntas')

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-navy-100 p-1">
        {abasVisiveis.map((a) => (
          <button
            key={a.key}
            onClick={() => setAba(a.key)}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              aba === a.key ? 'bg-navy-900 text-white' : 'text-navy-700 hover:bg-navy-50',
            )}
          >
            <a.icon size={14} /> {a.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {aba === 'info' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="codigo">Código GRI</Label>
                <Input
                  id="codigo"
                  placeholder="ex: 2-15"
                  value={form.codigo_gri}
                  disabled={!!editing}
                  onChange={(e) => setForm({ ...form, codigo_gri: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status inicial</Label>
                <Select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as IndicadorInput['status'] })}
                  disabled={!!editing}
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {editing && (
              <p className="-mt-2 text-xs text-navy-700/60">O status é atualizado no dia a dia pela aba GRI.</p>
            )}
            <div>
              <Label htmlFor="titulo">Título do indicador</Label>
              <Input id="titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="area">Área responsável</Label>
              <Select
                id="area"
                value={form.area_id ?? ''}
                onChange={(e) => setForm({ ...form, area_id: e.target.value || null })}
              >
                <option value="">Sem área</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Respondentes (pode selecionar mais de um)</Label>
              {respondentesDaArea.length === 0 ? (
                <p className="text-sm text-navy-700/60">Nenhum colaborador com papel de respondente disponível.</p>
              ) : (
                <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-navy-100 p-2.5">
                  {respondentesDaArea.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 text-sm text-navy-950">
                      <input
                        type="checkbox"
                        checked={respondenteIds.includes(r.id)}
                        onChange={() => toggleRespondente(r.id)}
                      />
                      {r.nome}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="ficha">Anotações da ficha (opcional)</Label>
              <Textarea
                id="ficha"
                rows={3}
                value={form.ficha_conteudo ?? ''}
                onChange={(e) => setForm({ ...form, ficha_conteudo: e.target.value || null })}
              />
            </div>
          </>
        )}

        {aba === 'cronograma' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="prazo">Data de entrega</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={form.prazo ?? ''}
                  onChange={(e) => setForm({ ...form, prazo: e.target.value || null })}
                />
              </div>
              <div>
                <Label htmlFor="expectativa">Expectativa de entrega</Label>
                <Input
                  id="expectativa"
                  type="date"
                  value={form.expectativa_entrega ?? ''}
                  onChange={(e) => setForm({ ...form, expectativa_entrega: e.target.value || null })}
                />
              </div>
            </div>
            <div className="max-w-[calc(50%-0.375rem)]">
              <Label htmlFor="vencimento">Vencimento</Label>
              <Input
                id="vencimento"
                type="date"
                value={form.vencimento ?? ''}
                onChange={(e) => setForm({ ...form, vencimento: e.target.value || null })}
              />
            </div>
          </>
        )}

        {aba === 'perguntas' && editing && <PerguntasCatalogo indicadorId={editing.id} />}

        {aba !== 'perguntas' && (
          <Button onClick={handleSave} disabled={saving} className="mt-1">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        )}
      </div>
    </>
  )
}

export function IndicadorCatalogoDialog({
  open,
  onOpenChange,
  editing,
  areas,
  respondentes,
  respondenteIdsSelecionados,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Indicador | null
  areas: Area[]
  respondentes: Respondente[]
  respondenteIdsSelecionados: string[]
  onSave: (input: IndicadorInput, respondenteIds: string[]) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>{editing ? `${editing.codigo_gri} — ${editing.titulo}` : 'Novo indicador'}</DialogTitle>
      <IndicadorCatalogoForm
        editing={editing}
        areas={areas}
        respondentes={respondentes}
        respondenteIdsSelecionados={respondenteIdsSelecionados}
        onSave={onSave}
        onSaved={() => onOpenChange(false)}
      />
    </Dialog>
  )
}
