import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useCapitulos } from '@/hooks/useCapitulos'
import { useIndicadorCapitulos } from '@/hooks/useIndicadorCapitulos'
import { useIndicadores } from '@/hooks/useIndicadores'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { STATUS_PREENCHIDO } from '@/lib/domain'
import type { Capitulo } from '@/types/db'

export function RelatorioPage() {
  const { capitulos, loading, createCapitulo, updateCapitulo, deleteCapitulo } = useCapitulos()
  const { indicadorIdsDoCapitulo } = useIndicadorCapitulos()
  const { indicadores } = useIndicadores()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Capitulo | null>(null)
  const [nome, setNome] = useState('')
  const [ordem, setOrdem] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)

  const indicadorPorId = useMemo(() => new Map(indicadores.map((i) => [i.id, i])), [indicadores])

  function openCreate() {
    setEditing(null)
    setNome('')
    setOrdem(String(capitulos.length + 1))
    setDialogOpen(true)
  }

  function openEdit(cap: Capitulo) {
    setEditing(cap)
    setNome(cap.nome)
    setOrdem(cap.ordem?.toString() ?? '')
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!nome.trim()) return
    setSaving(true)
    const ordemNum = ordem.trim() ? Number(ordem) : null
    if (editing) {
      await updateCapitulo(editing.id, { nome: nome.trim(), ordem: ordemNum })
    } else {
      await createCapitulo(nome.trim(), ordemNum)
    }
    setSaving(false)
    setDialogOpen(false)
  }

  const semDados = !loading && capitulos.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Relatório</h1>
          <p className="text-sm text-navy-700/70">
            Capítulos do relatório e quais indicadores GRI aparecem em cada um. Classifique o capítulo dentro de
            cada indicador em Coleta de Indicadores.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Novo capítulo
        </Button>
      </div>

      {semDados ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="Nenhum capítulo cadastrado"
          description="Cadastre os capítulos do relatório e depois classifique cada indicador em Coleta de Indicadores."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} /> Cadastrar capítulo
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {capitulos.map((cap) => {
            const idsIndicadores = indicadorIdsDoCapitulo(cap.id)
            const indicadoresDoCapitulo = idsIndicadores
              .map((id) => indicadorPorId.get(id))
              .filter((i): i is NonNullable<typeof i> => !!i)
            const total = indicadoresDoCapitulo.length
            const preenchidos = indicadoresDoCapitulo.filter((i) => STATUS_PREENCHIDO.includes(i.status)).length
            const aberto = expandido === cap.id

            return (
              <Card key={cap.id} className="overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandido(aberto ? null : cap.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setExpandido(aberto ? null : cap.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-navy-950">{cap.nome}</span>
                      <span className="text-xs text-navy-700/60">
                        {total} indicador{total === 1 ? '' : 'es'}
                      </span>
                    </div>
                    <ProgressBar value={total ? (preenchidos / total) * 100 : 0} className="h-1.5 max-w-md" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(cap)
                      }}
                      className="rounded-md p-1.5 text-navy-700 hover:bg-navy-100"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCapitulo(cap.id)
                      }}
                      className="rounded-md p-1.5 text-pillar-social hover:bg-pillar-social-100"
                    >
                      <Trash2 size={15} />
                    </button>
                    {aberto ? <ChevronUp size={18} className="text-navy-700/50" /> : <ChevronDown size={18} className="text-navy-700/50" />}
                  </div>
                </div>

                {aberto && (
                  <div className="border-t border-navy-100 px-4 pb-4 pt-3">
                    {indicadoresDoCapitulo.length === 0 ? (
                      <p className="text-sm text-navy-700/60">
                        Nenhum indicador classificado neste capítulo ainda.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-1.5">
                        {indicadoresDoCapitulo.map((ind) => (
                          <li
                            key={ind.id}
                            className="flex items-center justify-between gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-navy-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                                {ind.codigo_gri}
                              </span>
                              <span className="font-medium text-navy-950">{ind.titulo}</span>
                            </div>
                            <StatusBadge status={ind.status} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle>{editing ? editing.nome : 'Novo capítulo'}</DialogTitle>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome-capitulo">Nome do capítulo</Label>
            <Input
              id="nome-capitulo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="ex: Governança Corporativa"
            />
          </div>
          <div>
            <Label htmlFor="ordem-capitulo">Ordem (opcional)</Label>
            <Input
              id="ordem-capitulo"
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="mt-1">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
