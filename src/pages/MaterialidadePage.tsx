import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Target, ChevronDown, ChevronUp } from 'lucide-react'
import { useTemasMateriais } from '@/hooks/useTemasMateriais'
import { useIndicadorTemasMateriais } from '@/hooks/useIndicadorTemasMateriais'
import { useIndicadores } from '@/hooks/useIndicadores'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { STATUS_PREENCHIDO } from '@/lib/domain'
import type { TemaMaterial } from '@/types/db'

export function MaterialidadePage() {
  const { temas, loading, createTema, updateTema, deleteTema } = useTemasMateriais()
  const { indicadorIdsDoTema } = useIndicadorTemasMateriais()
  const { indicadores } = useIndicadores()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TemaMaterial | null>(null)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)

  const indicadorPorId = useMemo(() => new Map(indicadores.map((i) => [i.id, i])), [indicadores])

  function openCreate() {
    setEditing(null)
    setNome('')
    setDescricao('')
    setDialogOpen(true)
  }

  function openEdit(tema: TemaMaterial) {
    setEditing(tema)
    setNome(tema.nome)
    setDescricao(tema.descricao ?? '')
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!nome.trim()) return
    setSaving(true)
    if (editing) {
      await updateTema(editing.id, { nome: nome.trim(), descricao: descricao.trim() || null })
    } else {
      await createTema(nome.trim(), descricao.trim() || null)
    }
    setSaving(false)
    setDialogOpen(false)
  }

  const semDados = !loading && temas.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Materialidade</h1>
          <p className="text-sm text-navy-700/70">
            Temas materiais e o andamento dos indicadores classificados como relevantes para cada um. Classifique o
            tema dentro de cada indicador em GRI.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Novo tema material
        </Button>
      </div>

      {semDados ? (
        <EmptyState
          icon={<Target size={32} />}
          title="Nenhum tema material cadastrado"
          description="Cadastre os temas materiais da matriz de materialidade e depois classifique cada indicador em GRI."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} /> Cadastrar tema material
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {temas.map((tema) => {
            const idsIndicadores = indicadorIdsDoTema(tema.id)
            const indicadoresDoTema = idsIndicadores
              .map((id) => indicadorPorId.get(id))
              .filter((i): i is NonNullable<typeof i> => !!i)
            const total = indicadoresDoTema.length
            const preenchidos = indicadoresDoTema.filter((i) => STATUS_PREENCHIDO.includes(i.status)).length
            const aberto = expandido === tema.id

            return (
              <Card key={tema.id} className="overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandido(aberto ? null : tema.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setExpandido(aberto ? null : tema.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-navy-950">{tema.nome}</span>
                      <span className="text-xs text-navy-700/60">
                        {total} indicador{total === 1 ? '' : 'es'}
                      </span>
                    </div>
                    {tema.descricao && <p className="mb-1.5 text-xs text-navy-700/70">{tema.descricao}</p>}
                    <ProgressBar value={total ? (preenchidos / total) * 100 : 0} className="h-1.5 max-w-md" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(tema)
                      }}
                      className="rounded-md p-1.5 text-navy-700 hover:bg-navy-100"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTema(tema.id)
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
                    {indicadoresDoTema.length === 0 ? (
                      <p className="text-sm text-navy-700/60">
                        Nenhum indicador classificado como relevante para este tema ainda.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-1.5">
                        {indicadoresDoTema.map((ind) => (
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
        <DialogTitle>{editing ? editing.nome : 'Novo tema material'}</DialogTitle>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nome-tema">Nome do tema material</Label>
            <Input
              id="nome-tema"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="ex: Mudanças climáticas"
            />
          </div>
          <div>
            <Label htmlFor="descricao-tema">Descrição (opcional)</Label>
            <Textarea
              id="descricao-tema"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
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
