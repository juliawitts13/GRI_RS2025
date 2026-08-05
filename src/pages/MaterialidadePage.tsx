import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Target, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { useTemasMateriais } from '@/hooks/useTemasMateriais'
import { useIndicadorTemasMateriais } from '@/hooks/useIndicadorTemasMateriais'
import { useIndicadores } from '@/hooks/useIndicadores'
import { useOds } from '@/hooks/useOds'
import { useTemaMaterialOds } from '@/hooks/useTemaMaterialOds'
import { useProjetos } from '@/hooks/useProjetos'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { STATUS_PREENCHIDO, STATUS_PROJETO_LABEL, STATUS_PROJETO_ORDER } from '@/lib/domain'
import type { Projeto, StatusProjeto, TemaMaterial } from '@/types/db'

function ProjetosDoTema({
  temaId,
  projetos,
  onCreate,
  onUpdate,
  onDelete,
}: {
  temaId: string
  projetos: Projeto[]
  onCreate: (temaId: string, nome: string) => Promise<unknown>
  onUpdate: (id: string, patch: { nome?: string; status?: StatusProjeto }) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}) {
  const [novo, setNovo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNome, setEditingNome] = useState('')

  async function handleAdd() {
    if (!novo.trim()) return
    await onCreate(temaId, novo.trim())
    setNovo('')
  }

  function startEdit(p: Projeto) {
    setEditingId(p.id)
    setEditingNome(p.nome)
  }

  async function saveEdit() {
    if (editingId && editingNome.trim()) await onUpdate(editingId, { nome: editingNome.trim() })
    setEditingId(null)
  }

  return (
    <div>
      <Label>Projetos deste tema material</Label>
      <div className="flex flex-col gap-1.5">
        {projetos.map((p) =>
          editingId === p.id ? (
            <div key={p.id} className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={editingNome}
                onChange={(e) => setEditingNome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit()
                  if (e.key === 'Escape') setEditingId(null)
                }}
                className="text-sm"
              />
              <button onClick={saveEdit} className="shrink-0 rounded-md p-1.5 text-status-concluido hover:bg-status-concluido/10">
                <Check size={15} />
              </button>
              <button onClick={() => setEditingId(null)} className="shrink-0 rounded-md p-1.5 text-navy-700 hover:bg-navy-100">
                <X size={15} />
              </button>
            </div>
          ) : (
            <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm">
              <span onClick={() => startEdit(p)} className="cursor-pointer text-navy-950 hover:underline">
                {p.nome}
              </span>
              <div className="flex items-center gap-2">
                <Select
                  value={p.status}
                  onChange={(e) => onUpdate(p.id, { status: e.target.value as StatusProjeto })}
                  className="h-7 py-0 text-xs"
                >
                  {STATUS_PROJETO_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_PROJETO_LABEL[s]}
                    </option>
                  ))}
                </Select>
                <button onClick={() => onDelete(p.id)} className="shrink-0 rounded-md p-1 text-pillar-social hover:bg-pillar-social-100">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ),
        )}
        {projetos.length === 0 && <p className="text-sm text-navy-700/60">Nenhum projeto adicionado ainda.</p>}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          placeholder="ex: Programa de reflorestamento"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="text-sm"
        />
        <Button size="sm" variant="outline" onClick={handleAdd} disabled={!novo.trim()}>
          <Plus size={14} /> Adicionar
        </Button>
      </div>
    </div>
  )
}

export function MaterialidadePage() {
  const { temas, loading, createTema, updateTema, deleteTema } = useTemasMateriais()
  const { indicadorIdsDoTema } = useIndicadorTemasMateriais()
  const { indicadores } = useIndicadores()
  const { ods } = useOds()
  const { odsIdsDoTema, definirOdsDoTema } = useTemaMaterialOds()
  const { projetosDoTema, createProjeto, updateProjeto, deleteProjeto } = useProjetos()

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

  function toggleOds(temaId: string, odsId: number) {
    const atuais = odsIdsDoTema(temaId)
    const proximos = atuais.includes(odsId) ? atuais.filter((id) => id !== odsId) : [...atuais, odsId]
    definirOdsDoTema(temaId, proximos)
  }

  const semDados = !loading && temas.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Materialidade</h1>
          <p className="text-sm text-navy-700/70">
            Temas materiais, ODS relacionados e o andamento conforme os indicadores GRI e projetos classificados
            como relevantes. Clique em um tema para editar tudo diretamente.
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
            const projetos = projetosDoTema(tema.id)
            const totalIndicadores = indicadoresDoTema.length
            const preenchidosIndicadores = indicadoresDoTema.filter((i) => STATUS_PREENCHIDO.includes(i.status)).length
            const projetosConcluidos = projetos.filter((p) => p.status === 'concluido').length
            const total = totalIndicadores + projetos.length
            const preenchidos = preenchidosIndicadores + projetosConcluidos
            const aberto = expandido === tema.id
            const idsOds = odsIdsDoTema(tema.id)
            const odsDoTema = idsOds.map((id) => ods.find((o) => o.id === id)).filter((o): o is NonNullable<typeof o> => !!o)

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
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-navy-950">{tema.nome}</span>
                      <span className="text-xs text-navy-700/60">
                        {totalIndicadores} indicador{totalIndicadores === 1 ? '' : 'es'} · {projetos.length} projeto
                        {projetos.length === 1 ? '' : 's'}
                      </span>
                      {odsDoTema.map((o) => (
                        <span key={o.id} className="rounded-full bg-navy-900 px-2 py-0.5 text-[11px] font-bold text-white">
                          ODS {o.numero}
                        </span>
                      ))}
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
                  <div className="flex flex-col gap-5 border-t border-navy-100 px-4 pb-5 pt-4">
                    <div>
                      <Label>ODS relacionados (pode selecionar mais de um)</Label>
                      <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto rounded-lg border border-navy-100 p-2.5">
                        {ods.map((o) => (
                          <label key={o.id} className="flex items-center gap-2 text-sm text-navy-950">
                            <input type="checkbox" checked={idsOds.includes(o.id)} onChange={() => toggleOds(tema.id, o.id)} />
                            <span className="rounded-md bg-navy-900 px-1.5 py-0.5 text-[11px] font-bold text-white">{o.numero}</span>
                            {o.nome}
                          </label>
                        ))}
                      </div>
                    </div>

                    <ProjetosDoTema
                      temaId={tema.id}
                      projetos={projetos}
                      onCreate={createProjeto}
                      onUpdate={updateProjeto}
                      onDelete={deleteProjeto}
                    />

                    <div>
                      <Label>Indicadores GRI classificados como relevantes</Label>
                      {indicadoresDoTema.length === 0 ? (
                        <p className="text-sm text-navy-700/60">
                          Nenhum indicador classificado como relevante para este tema ainda — classifique em GRI.
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
