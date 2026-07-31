import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import type { Area, Respondente } from '@/types/db'
import { parseIndicadoresFile, type ImportResult } from '@/lib/importIndicadores'
import type { IndicadorInput } from '@/hooks/useIndicadores'

export function ImportDialog({
  open,
  onOpenChange,
  areas,
  respondentes,
  onImport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  areas: Area[]
  respondentes: Respondente[]
  onImport: (itens: IndicadorInput[]) => Promise<void>
}) {
  const [result, setResult] = useState<ImportResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  async function handleFile(file: File) {
    setFileName(file.name)
    const res = await parseIndicadoresFile(file, { areas, respondentes })
    setResult(res)
  }

  async function handleConfirm() {
    if (!result) return
    setImporting(true)
    await onImport(result.itens)
    setImporting(false)
    setResult(null)
    setFileName(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>Importar indicadores (CSV/XLSX)</DialogTitle>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-navy-700/80">
          A planilha deve ter colunas como <strong>Código GRI</strong>, Título, Área, Respondente, Status e Prazo.
          Indicadores existentes (mesmo código) são atualizados; novos são criados.
        </p>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-navy-100 px-6 py-10 text-center hover:border-orange-500">
          <UploadCloud className="text-navy-700/50" size={28} />
          <span className="text-sm font-semibold text-navy-950">
            {fileName ?? 'Clique para selecionar um arquivo .csv ou .xlsx'}
          </span>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>

        {result && (
          <div className="rounded-lg bg-navy-50 p-4 text-sm">
            <p className="font-semibold text-navy-950">{result.itens.length} indicador(es) reconhecido(s).</p>
            {result.avisos.length > 0 && (
              <ul className="mt-2 max-h-40 list-disc overflow-y-auto pl-5 text-xs text-navy-700/80">
                {result.avisos.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Button onClick={handleConfirm} disabled={!result || result.itens.length === 0 || importing}>
          {importing ? 'Importando...' : 'Confirmar importação'}
        </Button>
      </div>
    </Dialog>
  )
}
