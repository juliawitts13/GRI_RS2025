import { useMemo, useState } from 'react'
import { Plus, Trash2, Building2, Users } from 'lucide-react'
import { useAreas } from '@/hooks/useAreas'
import { useRespondentes } from '@/hooks/useRespondentes'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Area } from '@/types/db'

export function AreasPage() {
  const { areas, loading, createArea, updateArea, deleteArea } = useAreas()
  const { respondentes } = useRespondentes()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Area | null>(null)
  const [nome, setNome] = useState('')
  const [validadorId, setValidadorId] = useState('')
  const [saving, setSaving] = useState(false)

  const respondentesPorArea = useMemo(() => {
    const map = new Map<string, typeof respondentes>()
    for (const r of respondentes) {
      if (!r.area_id || !r.eh_respondente) continue
      if (!map.has(r.area_id)) map.set(r.area_id, [])
      map.get(r.area_id)!.push(r)
    }
    return map
  }, [respondentes])

  const validadores = useMemo(() => respondentes.filter((r) => r.eh_validador), [respondentes])
  const respondenteNomePorId = useMemo(() => new Map(respondentes.map((r) => [r.id, r.nome])), [respondentes])

  function openCreate() {
    setEditing(null)
    setNome('')
    setValidadorId('')
    setDialogOpen(true)
  }

  function openDetail(area: Area) {
    setEditing(area)
    setNome(area.nome)
    setValidadorId(area.validador_id ?? '')
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!nome.trim()) return
    setSaving(true)
    if (editing) {
      await updateArea(editing.id, { nome: nome.trim(), validador_id: validadorId || null })
    } else {
      await createArea(nome.trim())
    }
    setSaving(false)
    setDialogOpen(false)
  }

  const respondentesDaAreaEditando = editing ? respondentesPorArea.get(editing.id) ?? [] : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Áreas</h1>
          <p className="text-sm text-navy-700/70">
            Departamentos responsáveis pelos indicadores. Clique em uma área para ver respondentes e validador.
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
                <th className="px-5 py-3">Respondentes</th>
                <th className="px-5 py-3">Validador</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {areas.map((a) => (
                <tr key={a.id} onClick={() => openDetail(a)} className="cursor-pointer hover:bg-navy-50/50">
                  <td className="px-5 py-3 font-semibold text-navy-950">{a.nome}</td>
                  <td className="px-5 py-3 text-navy-700/80">{respondentesPorArea.get(a.id)?.length ?? 0}</td>
                  <td className="px-5 py-3 text-navy-700/80">
                    {a.validador_id ? respondenteNomePorId.get(a.validador_id) ?? '—' : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteArea(a.id)
                      }}
                      className="rounded-md p-1.5 text-pillar-social hover:bg-pillar-social-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle>{editing ? editing.nome : 'Nova área'}</DialogTitle>
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

          {editing && (
            <>
              <div>
                <Label htmlFor="validador">Validador das respostas</Label>
                <Select id="validador" value={validadorId} onChange={(e) => setValidadorId(e.target.value)}>
                  <option value="">Sem validador definido</option>
                  {validadores.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
                </Select>
                {validadores.length === 0 && (
                  <p className="mt-1 text-xs text-navy-700/60">
                    Nenhum colaborador marcado como validador ainda — edite um em Colaboradores.
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 flex items-center gap-1.5">
                  <Users size={13} /> Respondentes desta área
                </Label>
                {respondentesDaAreaEditando.length === 0 ? (
                  <p className="text-sm text-navy-700/60">
                    Nenhum respondente vinculado ainda. Cadastre em Colaboradores, marque como respondente e
                    selecione esta área.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {respondentesDaAreaEditando.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-navy-950">{r.nome}</span>
                        <span className="text-xs text-navy-700/60">{r.email || '—'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="mt-1">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
