import { useEffect, useState } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/domain'
import { formatarDataBr } from '@/lib/progress'
import { useIndicadorComentarios } from '@/hooks/useIndicadorComentarios'
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

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

function HistoricoComentarios({ indicadorId }: { indicadorId: string }) {
  const { comentarios, addComentario, deleteComentario } = useIndicadorComentarios(indicadorId)
  const [data, setData] = useState(hojeISO())
  const [texto, setTexto] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!texto.trim()) return
    setSaving(true)
    await addComentario(data, texto.trim())
    setSaving(false)
    setTexto('')
    setData(hojeISO())
  }

  return (
    <div className="flex flex-col gap-3 border-t border-navy-100 pt-4">
      <Label className="flex items-center gap-1.5">
        <MessageSquare size={13} /> Histórico de interação com o respondente
      </Label>

      <div className="flex flex-col gap-2 rounded-lg bg-navy-50 p-3">
        <div className="flex gap-2">
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-40" />
        </div>
        <Textarea
          rows={2}
          placeholder="Registrar uma interação, cobrança, dúvida respondida..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Button size="sm" variant="outline" onClick={handleAdd} disabled={saving || !texto.trim()} className="self-end">
          {saving ? 'Adicionando...' : 'Adicionar ao histórico'}
        </Button>
      </div>

      {comentarios.length === 0 ? (
        <p className="text-xs text-navy-700/60">Nenhum registro ainda.</p>
      ) : (
        <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
          {comentarios.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-2 rounded-lg border border-navy-100 p-2.5">
              <div>
                <p className="text-xs font-semibold text-navy-700/70">{formatarDataBr(c.data)}</p>
                <p className="text-sm text-navy-950">{c.texto}</p>
              </div>
              <button
                onClick={() => deleteComentario(c.id)}
                className="shrink-0 rounded-md p-1 text-pillar-social hover:bg-pillar-social-100"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function IndicadorFormDialog({
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
  const [form, setForm] = useState<IndicadorInput>(EMPTY)
  const [respondenteIds, setRespondenteIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, open])

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
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>{editing ? `${editing.codigo_gri} — ${editing.titulo}` : 'Novo indicador'}</DialogTitle>
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
            <Label htmlFor="prazo">Data de entrega</Label>
            <Input
              id="prazo"
              type="date"
              value={form.prazo ?? ''}
              onChange={(e) => setForm({ ...form, prazo: e.target.value || null })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="expectativa">Expectativa de entrega</Label>
            <Input
              id="expectativa"
              type="date"
              value={form.expectativa_entrega ?? ''}
              onChange={(e) => setForm({ ...form, expectativa_entrega: e.target.value || null })}
            />
          </div>
          <div>
            <Label htmlFor="vencimento">Vencimento</Label>
            <Input
              id="vencimento"
              type="date"
              value={form.vencimento ?? ''}
              onChange={(e) => setForm({ ...form, vencimento: e.target.value || null })}
            />
          </div>
        </div>
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

        {editing && <HistoricoComentarios indicadorId={editing.id} />}
      </div>
    </Dialog>
  )
}
