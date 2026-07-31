import { useEffect, useState } from 'react'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/domain'
import type { Area, Indicador, Respondente } from '@/types/db'
import type { IndicadorInput } from '@/hooks/useIndicadores'

const EMPTY: IndicadorInput = {
  codigo_gri: '',
  titulo: '',
  area_id: null,
  respondente_id: null,
  status: 'nao_iniciado',
  prazo: null,
  ficha_conteudo: null,
}

export function IndicadorFormDialog({
  open,
  onOpenChange,
  editing,
  areas,
  respondentes,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Indicador | null
  areas: Area[]
  respondentes: Respondente[]
  onSave: (input: IndicadorInput) => Promise<void>
}) {
  const [form, setForm] = useState<IndicadorInput>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editing) {
      setForm({
        codigo_gri: editing.codigo_gri,
        titulo: editing.titulo,
        area_id: editing.area_id,
        respondente_id: editing.respondente_id,
        status: editing.status,
        prazo: editing.prazo,
        ficha_conteudo: editing.ficha_conteudo,
      })
    } else {
      setForm(EMPTY)
    }
  }, [editing, open])

  const respondentesDaArea = form.area_id
    ? respondentes.filter((r) => r.area_id === form.area_id)
    : respondentes

  async function handleSave() {
    if (!form.codigo_gri.trim() || !form.titulo.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>{editing ? `Editar ${editing.codigo_gri}` : 'Novo indicador'}</DialogTitle>
      <div className="flex flex-col gap-4">
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
            <Label htmlFor="prazo">Prazo</Label>
            <Input
              id="prazo"
              type="date"
              value={form.prazo ?? ''}
              onChange={(e) => setForm({ ...form, prazo: e.target.value || null })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="titulo">Título do indicador</Label>
          <Input id="titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="area">Área responsável</Label>
            <Select
              id="area"
              value={form.area_id ?? ''}
              onChange={(e) => setForm({ ...form, area_id: e.target.value || null, respondente_id: null })}
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
            <Label htmlFor="respondente">Respondente</Label>
            <Select
              id="respondente"
              value={form.respondente_id ?? ''}
              onChange={(e) => setForm({ ...form, respondente_id: e.target.value || null })}
            >
              <option value="">Sem respondente</option>
              {respondentesDaArea.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as IndicadorInput['status'] })}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
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
        <Button onClick={handleSave} disabled={saving} className="mt-1">
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </Dialog>
  )
}
