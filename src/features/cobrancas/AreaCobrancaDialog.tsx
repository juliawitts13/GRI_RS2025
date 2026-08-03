import { useMemo, useState } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { formatarDataBr, hojeISO } from '@/lib/progress'
import type { Area, Indicador, IndicadorComentario } from '@/types/db'

export function AreaCobrancaDialog({
  open,
  onOpenChange,
  area,
  indicadoresDaArea,
  comentariosDaArea,
  respondenteIdsDoIndicador,
  respondenteNomePorId,
  validadorNome,
  addComentario,
  deleteComentario,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  area: Area | null
  indicadoresDaArea: Indicador[]
  comentariosDaArea: IndicadorComentario[]
  respondenteIdsDoIndicador: (indicadorId: string) => string[]
  respondenteNomePorId: Map<string, string>
  validadorNome: string | null
  addComentario: (indicadorId: string, data: string, texto: string) => Promise<{ error: string | null }>
  deleteComentario: (id: string) => Promise<{ error: string | null }>
}) {
  const [indicadorId, setIndicadorId] = useState('')
  const [data, setData] = useState(hojeISO())
  const [texto, setTexto] = useState('')
  const [saving, setSaving] = useState(false)

  const indicadorPorId = useMemo(() => new Map(indicadoresDaArea.map((i) => [i.id, i])), [indicadoresDaArea])
  const pendentes = indicadoresDaArea.filter((i) => i.status !== 'concluido')

  async function handleAdd() {
    const alvo = indicadorId || pendentes[0]?.id
    if (!alvo || !texto.trim()) return
    setSaving(true)
    await addComentario(alvo, data, texto.trim())
    setSaving(false)
    setTexto('')
    setData(hojeISO())
  }

  if (!area) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>{area.nome}</DialogTitle>
      <div className="flex flex-col gap-4">
        {validadorNome && (
          <p className="text-sm text-navy-700/70">
            Validador: <span className="font-semibold text-navy-950">{validadorNome}</span>
          </p>
        )}

        <div>
          <Label className="mb-1.5">Fichas pendentes desta área</Label>
          {pendentes.length === 0 ? (
            <p className="text-sm text-navy-700/60">Nenhuma ficha pendente — tudo concluído.</p>
          ) : (
            <ul className="flex max-h-32 flex-col gap-1.5 overflow-y-auto">
              {pendentes.map((i) => {
                const nomes = respondenteIdsDoIndicador(i.id)
                  .map((id) => respondenteNomePorId.get(id))
                  .filter(Boolean)
                  .join(', ')
                return (
                  <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg bg-navy-50 px-3 py-1.5 text-sm">
                    <span className="font-medium text-navy-950">
                      {i.codigo_gri} — {i.titulo}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-navy-700/70">
                      <span>{nomes || 'sem respondente'}</span>
                      <StatusBadge status={i.status} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-navy-100 pt-4">
          <Label className="flex items-center gap-1.5">
            <MessageSquare size={13} /> Histórico de cobrança da área
          </Label>

          <div className="flex flex-col gap-2 rounded-lg bg-navy-50 p-3">
            <div className="flex gap-2">
              <Select value={indicadorId} onChange={(e) => setIndicadorId(e.target.value)} className="flex-1">
                <option value="">
                  {pendentes[0] ? `Ficha: ${pendentes[0].codigo_gri} (padrão)` : 'Selecione a ficha'}
                </option>
                {indicadoresDaArea.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.codigo_gri} — {i.titulo}
                  </option>
                ))}
              </Select>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-40" />
            </div>
            <Textarea
              rows={2}
              placeholder="Registrar cobrança, lembrete enviado, resposta recebida..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdd}
              disabled={saving || !texto.trim() || indicadoresDaArea.length === 0}
              className="self-end"
            >
              {saving ? 'Registrando...' : 'Registrar cobrança'}
            </Button>
          </div>

          {comentariosDaArea.length === 0 ? (
            <p className="text-xs text-navy-700/60">Nenhum registro de cobrança ainda para esta área.</p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {comentariosDaArea.map((c) => {
                const ind = indicadorPorId.get(c.indicador_id)
                return (
                  <li key={c.id} className="flex items-start justify-between gap-2 rounded-lg border border-navy-100 p-2.5">
                    <div>
                      <p className="text-xs font-semibold text-navy-700/70">
                        {formatarDataBr(c.data)} {ind && `· ${ind.codigo_gri} — ${ind.titulo}`}
                      </p>
                      <p className="text-sm text-navy-950">{c.texto}</p>
                    </div>
                    <button
                      onClick={() => deleteComentario(c.id)}
                      className="shrink-0 rounded-md p-1 text-pillar-social hover:bg-pillar-social-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  )
}
