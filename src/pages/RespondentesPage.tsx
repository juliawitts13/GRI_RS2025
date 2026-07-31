import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { useRespondentes, type RespondenteInput } from '@/hooks/useRespondentes'
import { useAreas } from '@/hooks/useAreas'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Respondente } from '@/types/db'

const EMPTY_FORM: RespondenteInput = { nome: '', email: '', area_id: null, ativo: true }

export function RespondentesPage() {
  const { respondentes, loading, createRespondente, updateRespondente, deleteRespondente } = useRespondentes()
  const { areas, createArea } = useAreas()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Respondente | null>(null)
  const [form, setForm] = useState<RespondenteInput>(EMPTY_FORM)
  const [novaArea, setNovaArea] = useState('')
  const [saving, setSaving] = useState(false)

  const areaNomePorId = useMemo(() => new Map(areas.map((a) => [a.id, a.nome])), [areas])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(r: Respondente) {
    setEditing(r)
    setForm({ nome: r.nome, email: r.email, area_id: r.area_id, ativo: r.ativo })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.nome.trim()) return
    setSaving(true)
    if (editing) {
      await updateRespondente(editing.id, form)
    } else {
      await createRespondente(form)
    }
    setSaving(false)
    setDialogOpen(false)
  }

  async function handleAddArea() {
    if (!novaArea.trim()) return
    await createArea(novaArea.trim())
    setNovaArea('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Respondentes</h1>
          <p className="text-sm text-navy-700/70">Cadastro de quem responde cada indicador, por área.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Novo respondente
        </Button>
      </div>

      <Card className="p-5">
        <p className="mb-2 text-sm font-semibold text-navy-950">Áreas cadastradas</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {areas.map((a) => (
            <span key={a.id} className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-900">
              {a.nome}
            </span>
          ))}
          {areas.length === 0 && <span className="text-xs text-navy-700/60">Nenhuma área cadastrada ainda.</span>}
        </div>
        <div className="flex max-w-sm gap-2">
          <Input
            placeholder="Nome da nova área"
            value={novaArea}
            onChange={(e) => setNovaArea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddArea()}
          />
          <Button variant="outline" onClick={handleAddArea}>
            Adicionar
          </Button>
        </div>
      </Card>

      {!loading && respondentes.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Nenhum respondente cadastrado"
          description="Cadastre as pessoas designadas para responder os indicadores de cada área."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} /> Cadastrar respondente
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs font-semibold uppercase text-navy-700/70">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">Área</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {respondentes.map((r) => (
                <tr key={r.id} className="hover:bg-navy-50/50">
                  <td className="px-5 py-3 font-semibold text-navy-950">{r.nome}</td>
                  <td className="px-5 py-3 text-navy-700/80">{r.email || '—'}</td>
                  <td className="px-5 py-3 text-navy-700/80">
                    {r.area_id ? areaNomePorId.get(r.area_id) ?? '—' : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        r.ativo
                          ? 'rounded-full bg-status-concluido/10 px-2.5 py-1 text-xs font-semibold text-status-concluido'
                          : 'rounded-full bg-status-nao-iniciado/10 px-2.5 py-1 text-xs font-semibold text-status-nao-iniciado'
                      }
                    >
                      {r.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(r)} className="rounded-md p-1.5 text-navy-700 hover:bg-navy-100">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteRespondente(r.id)}
                        className="rounded-md p-1.5 text-pillar-social hover:bg-pillar-social-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle>{editing ? 'Editar respondente' : 'Novo respondente'}</DialogTitle>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email ?? ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="area">Área</Label>
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
          <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            Respondente ativo
          </label>
          <Button onClick={handleSave} disabled={saving} className="mt-2">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
