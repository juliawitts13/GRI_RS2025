import { useState } from 'react'
import { Trash2, ListChecks, Layers, History } from 'lucide-react'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/domain'
import { formatarDataBr } from '@/lib/progress'
import { useIndicadorComentarios } from '@/hooks/useIndicadorComentarios'
import { useIndicadorPerguntas } from '@/hooks/useIndicadorPerguntas'
import { cn } from '@/lib/utils'
import type { Capitulo, Indicador, Respondente, StatusIndicador, TemaMaterial } from '@/types/db'

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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-lg bg-navy-50 p-3">
        <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-40" />
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
        <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
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

function PerguntasOperacional({
  indicadorId,
  respondentesDoIndicador,
}: {
  indicadorId: string
  respondentesDoIndicador: Respondente[]
}) {
  const { perguntas, updatePergunta } = useIndicadorPerguntas(indicadorId)
  const [respondenteEmMassa, setRespondenteEmMassa] = useState('')
  const [aplicandoEmMassa, setAplicandoEmMassa] = useState(false)

  async function handleAplicarEmMassa() {
    if (perguntas.length === 0) return
    setAplicandoEmMassa(true)
    await Promise.all(perguntas.map((p) => updatePergunta(p.id, { respondente_id: respondenteEmMassa || null })))
    setAplicandoEmMassa(false)
  }

  const respondidas = perguntas.filter((p) => p.respondida).length

  return (
    <div className="flex flex-col gap-3">
      <Label className="flex items-center gap-1.5">
        <ListChecks size={13} /> Perguntas
        {perguntas.length > 0 && (
          <span className="font-normal text-navy-700/60">
            ({respondidas}/{perguntas.length} respondidas)
          </span>
        )}
      </Label>

      {perguntas.length === 0 ? (
        <p className="text-sm text-navy-700/60">
          Nenhuma pergunta cadastrada ainda — cadastre em Configurações.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-lg bg-navy-50 p-2.5">
            <Select
              value={respondenteEmMassa}
              onChange={(e) => setRespondenteEmMassa(e.target.value)}
              className="h-8 flex-1 py-0 text-xs"
              disabled={respondentesDoIndicador.length === 0}
            >
              <option value="">Marcar todas com: sem responsável definido</option>
              {respondentesDoIndicador.map((r) => (
                <option key={r.id} value={r.id}>
                  Marcar todas com: {r.nome}
                </option>
              ))}
            </Select>
            <Button size="sm" variant="outline" onClick={handleAplicarEmMassa} disabled={aplicandoEmMassa}>
              {aplicandoEmMassa ? 'Aplicando...' : 'Aplicar a todas'}
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            {perguntas.map((p) => (
              <div key={p.id} className="flex flex-col gap-1.5 rounded-lg bg-navy-50 px-3 py-2 text-sm">
                <label className="flex items-center gap-2 text-navy-950">
                  <input
                    type="checkbox"
                    checked={p.respondida}
                    onChange={(e) => updatePergunta(p.id, { respondida: e.target.checked })}
                  />
                  <span className={cn(p.respondida && 'text-navy-700/60 line-through')}>{p.texto}</span>
                </label>
                <div className="pl-6">
                  <Select
                    value={p.respondente_id ?? ''}
                    onChange={(e) => updatePergunta(p.id, { respondente_id: e.target.value || null })}
                    className="h-7 py-0 text-xs"
                    disabled={respondentesDoIndicador.length === 0}
                  >
                    <option value="">Quem responde: sem responsável definido</option>
                    {respondentesDoIndicador.map((r) => (
                      <option key={r.id} value={r.id}>
                        Quem responde: {r.nome}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

type AbaOperacional = 'perguntas' | 'estrutura' | 'historico'

const ABAS_OPERACIONAIS: { key: AbaOperacional; label: string; icon: typeof ListChecks }[] = [
  { key: 'perguntas', label: 'Perguntas', icon: ListChecks },
  { key: 'estrutura', label: 'Estrutura', icon: Layers },
  { key: 'historico', label: 'Histórico', icon: History },
]

export function IndicadorOperacional({
  indicador,
  respondentesDoIndicador,
  capitulos,
  capituloIdsSelecionados,
  onToggleCapitulo,
  temas,
  temaIdsSelecionados,
  onToggleTema,
  onStatusChange,
}: {
  indicador: Indicador
  respondentesDoIndicador: Respondente[]
  capitulos: Capitulo[]
  capituloIdsSelecionados: string[]
  onToggleCapitulo: (capituloId: string) => void
  temas: TemaMaterial[]
  temaIdsSelecionados: string[]
  onToggleTema: (temaId: string) => void
  onStatusChange: (status: StatusIndicador) => void
}) {
  const [aba, setAba] = useState<AbaOperacional>('perguntas')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="status-operacional">Status</Label>
        <Select
          id="status-operacional"
          value={indicador.status}
          onChange={(e) => onStatusChange(e.target.value as StatusIndicador)}
          className="max-w-xs"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-navy-100 p-1">
        {ABAS_OPERACIONAIS.map((a) => (
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

      {aba === 'perguntas' && (
        <PerguntasOperacional indicadorId={indicador.id} respondentesDoIndicador={respondentesDoIndicador} />
      )}

      {aba === 'estrutura' && (
        <>
          <div>
            <Label>Capítulos do relatório (pode selecionar mais de um)</Label>
            {capitulos.length === 0 ? (
              <p className="text-sm text-navy-700/60">Nenhum capítulo cadastrado ainda.</p>
            ) : (
              <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-navy-100 p-2.5">
                {capitulos.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-navy-950">
                    <input
                      type="checkbox"
                      checked={capituloIdsSelecionados.includes(c.id)}
                      onChange={() => onToggleCapitulo(c.id)}
                    />
                    {c.nome}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>Temas materiais (pode selecionar mais de um)</Label>
            {temas.length === 0 ? (
              <p className="text-sm text-navy-700/60">Nenhum tema material cadastrado ainda.</p>
            ) : (
              <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-navy-100 p-2.5">
                {temas.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm text-navy-950">
                    <input
                      type="checkbox"
                      checked={temaIdsSelecionados.includes(t.id)}
                      onChange={() => onToggleTema(t.id)}
                    />
                    {t.nome}
                  </label>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {aba === 'historico' && <HistoricoComentarios indicadorId={indicador.id} />}
    </div>
  )
}
