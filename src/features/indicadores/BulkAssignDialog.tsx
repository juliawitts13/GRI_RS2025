import { useState } from 'react'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/domain'
import type { Area, Respondente, StatusIndicador } from '@/types/db'
import type { IndicadorInput } from '@/hooks/useIndicadores'

const NAO_ALTERAR = '__nao_alterar__'
const NAO_ADICIONAR = '__nao_adicionar__'

export function BulkAssignDialog({
  open,
  onOpenChange,
  count,
  areas,
  respondentes,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  areas: Area[]
  respondentes: Respondente[]
  onApply: (patch: Partial<IndicadorInput>, respondenteIdParaAdicionar: string | null) => Promise<void>
}) {
  const [areaId, setAreaId] = useState(NAO_ALTERAR)
  const [respondenteId, setRespondenteId] = useState(NAO_ADICIONAR)
  const [status, setStatus] = useState(NAO_ALTERAR)
  const [prazo, setPrazo] = useState('')
  const [saving, setSaving] = useState(false)

  const respondentesElegiveis = respondentes.filter((r) => r.eh_respondente)
  const respondentesDaArea =
    areaId !== NAO_ALTERAR && areaId !== '' ? respondentesElegiveis.filter((r) => r.area_id === areaId) : respondentesElegiveis

  function reset() {
    setAreaId(NAO_ALTERAR)
    setRespondenteId(NAO_ADICIONAR)
    setStatus(NAO_ALTERAR)
    setPrazo('')
  }

  async function handleApply() {
    const patch: Partial<IndicadorInput> = {}
    if (areaId !== NAO_ALTERAR) patch.area_id = areaId || null
    if (status !== NAO_ALTERAR) patch.status = status as StatusIndicador
    if (prazo) patch.prazo = prazo
    const respondenteIdParaAdicionar = respondenteId !== NAO_ADICIONAR ? respondenteId : null
    if (Object.keys(patch).length === 0 && !respondenteIdParaAdicionar) return
    setSaving(true)
    await onApply(patch, respondenteIdParaAdicionar)
    setSaving(false)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogTitle>Atribuir em lote ({count} indicador{count === 1 ? '' : 'es'})</DialogTitle>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-navy-700/70">
          Só os campos que você alterar aqui serão aplicados aos indicadores selecionados — o resto permanece como
          está. Um indicador pode ter mais de um respondente: o escolhido abaixo é adicionado, sem remover quem já
          estava atribuído.
        </p>
        <div>
          <Label htmlFor="bulk-area">Área responsável</Label>
          <Select
            id="bulk-area"
            value={areaId}
            onChange={(e) => {
              setAreaId(e.target.value)
              setRespondenteId(NAO_ADICIONAR)
            }}
          >
            <option value={NAO_ALTERAR}>Não alterar</option>
            <option value="">Sem área</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="bulk-respondente">Adicionar respondente</Label>
          <Select id="bulk-respondente" value={respondenteId} onChange={(e) => setRespondenteId(e.target.value)}>
            <option value={NAO_ADICIONAR}>Não adicionar</option>
            {respondentesDaArea.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="bulk-status">Status</Label>
          <Select id="bulk-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value={NAO_ALTERAR}>Não alterar</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="bulk-prazo">Data de entrega</Label>
          <Input id="bulk-prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </div>
        <Button onClick={handleApply} disabled={saving} className="mt-1">
          {saving ? 'Aplicando...' : `Aplicar a ${count} indicador${count === 1 ? '' : 'es'}`}
        </Button>
      </div>
    </Dialog>
  )
}
