import { useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { useAreas } from '@/hooks/useAreas'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Area } from '@/types/db'

export function AreasPage() {
  const { areas, loading, createArea, updateArea, deleteArea } = useAreas()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Area | null>(null)
  const [nome, setNome] = useState('')
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setNome('')
    setDialogOpen(true)
  }

  function openEdit(area: Area) {
    setEditing(area)
    setNome(area.nome)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!nome.trim()) return
    setSaving(true)
    if (editing) {
      await updateArea(editing.id, nome.trim())
    } else {
      await createArea(nome.trim())
    }
    setSaving(false)
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Áreas</h1>
          <p className="text-sm text-navy-700/70">
            Departamentos responsáveis pelos indicadores. Cadastre aqui antes de vincular um respondente a uma área.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Nova área
        </Button>
      </div>

      {!loading && areas.length === 0 ? (
        <EmptyState
          icon={<Building2 size={32} />}
          title="Nenhuma área cadastrada"
          description="Cadastre as áreas/departamentos da empresa para depois vincular respondentes e indicadores a elas."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} /> Cadastrar área
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs font-semibold uppercase text-navy-700/70">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {areas.map((a) => (
                <tr key={a.id} className="hover:bg-navy-50/50">
                  <td className="px-5 py-3 font-semibold text-navy-950">{a.nome}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(a)} className="rounded-md p-1.5 text-navy-700 hover:bg-navy-100">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteArea(a.id)}
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
        <DialogTitle>{editing ? 'Editar área' : 'Nova área'}</DialogTitle>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome-area">Nome da área</Label>
            <Input
              id="nome-area"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="ex: Recursos Humanos"
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
