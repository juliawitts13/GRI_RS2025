import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { useRespondentes, type RespondenteInput } from '@/hooks/useRespondentes'
import { useAreas } from '@/hooks/useAreas'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Respondente } from '@/types/db'

const EMPTY_FORM: RespondenteInput = {
  nome: '',
  email: '',
  area_id: null,
  ativo: true,
  eh_respondente: true,
  eh_validador: false,
}

export function ColaboradoresPage() {
  const { respondentes, loading, createRespondente, updateRespondente, deleteRespondente } = useRespondentes()
  const { areas } = useAreas()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Respondente | null>(null)
  const [form, setForm] = useState<RespondenteInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const areaNomePorId = useMemo(() => new Map(areas.map((a) => [a.id, a.nome])), [areas])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(r: Respondente) {
    setEditing(r)
    setForm({
      nome: r.nome,
      email: r.email,
      area_id: r.area_id,
      ativo: r.ativo,
      eh_respondente: r.eh_respondente,
      eh_validador: r.eh_validador,
    })
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Colaboradores</h1>
          <p className="text-sm text-navy-700/70">
            Pessoas envolvidas na coleta, classificadas como respondente e/ou validador de cada área.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Novo colaborador
        </Button>
      </div>

      {!loading && respondentes.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Nenhum colaborador cadastrado"
          description="Cadastre as pessoas envolvidas na coleta e classifique cada uma como respondente e/ou validador."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} /> Cadastrar colaborador
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
                <th className="px-5 py-3">Papel</th>
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
                    <div className="flex flex-wrap gap-1.5">
                      {r.eh_respondente && (
                        <Badge className="bg-navy-100 text-navy-900">Respondente</Badge>
                      )}
                      {r.eh_validador && (
                        <Badge className="bg-pillar-governanca-100 text-pillar-governanca">Validador</Badge>
                      )}
                      {!r.eh_respondente && !r.eh_validador && (
                        <span className="text-xs text-navy-700/50">—</span>
                      )}
                    </div>
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
        <DialogTitle>{editing ? 'Editar colaborador' : 'Novo colaborador'}</DialogTitle>
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
          <div>
            <Label>Papel</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
                <input
                  type="checkbox"
                  checked={form.eh_respondente}
                  onChange={(e) => setForm({ ...form, eh_respondente: e.target.checked })}
                />
                Respondente (preenche fichas de indicadores)
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
                <input
                  type="checkbox"
                  checked={form.eh_validador}
                  onChange={(e) => setForm({ ...form, eh_validador: e.target.checked })}
                />
                Validador (aprova as respostas de uma área)
              </label>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            Colaborador ativo
          </label>
          <Button onClick={handleSave} disabled={saving} className="mt-2">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
