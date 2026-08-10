import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Pencil, BookOpen, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { useCapitulos } from '@/hooks/useCapitulos'
import { useIndicadorCapitulos } from '@/hooks/useIndicadorCapitulos'
import { useIndicadores } from '@/hooks/useIndicadores'
import { useTemasMateriais } from '@/hooks/useTemasMateriais'
import { useCapituloTemasMateriais } from '@/hooks/useCapituloTemasMateriais'
import { useCapituloTopicos } from '@/hooks/useCapituloTopicos'
import { useEntrevistas } from '@/hooks/useEntrevistas'
import { useEntrevistaCapitulos } from '@/hooks/useEntrevistaCapitulos'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogTitle } from '@/components/ui/Dialog'
import { Input, Label } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { STATUS_PREENCHIDO } from '@/lib/domain'
import type { Capitulo, CapituloTopico, Indicador, TemaMaterial } from '@/types/db'

function TopicosDoCapitulo({
  capituloId,
  topicos,
  onAdd,
  onUpdate,
  onDelete,
}: {
  capituloId: string
  topicos: CapituloTopico[]
  onAdd: (capituloId: string, texto: string) => Promise<unknown>
  onUpdate: (id: string, texto: string) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}) {
  const [novo, setNovo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTexto, setEditingTexto] = useState('')

  async function handleAdd() {
    if (!novo.trim()) return
    await onAdd(capituloId, novo.trim())
    setNovo('')
  }

  function startEdit(t: CapituloTopico) {
    setEditingId(t.id)
    setEditingTexto(t.texto)
  }

  async function saveEdit() {
    if (editingId && editingTexto.trim()) await onUpdate(editingId, editingTexto.trim())
    setEditingId(null)
  }

  return (
    <div>
      <Label>Tópicos a abordar no capítulo</Label>
      <div className="flex flex-col gap-1.5">
        {topicos.map((t) =>
          editingId === t.id ? (
            <div key={t.id} className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={editingTexto}
                onChange={(e) => setEditingTexto(e.target.value)}
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
            <div
              key={t.id}
              onClick={() => startEdit(t)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-950 hover:bg-navy-100"
            >
              <span>{t.texto}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(t.id)
                }}
                className="shrink-0 rounded-md p-1 text-pillar-social hover:bg-pillar-social-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ),
        )}
        {topicos.length === 0 && <p className="text-sm text-navy-700/60">Nenhum tópico adicionado ainda.</p>}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          placeholder="ex: Composição do conselho de administração"
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

export function RelatorioPage() {
  const { capitulos, loading, createCapitulo, updateCapitulo, deleteCapitulo } = useCapitulos()
  const { indicadorIdsDoCapitulo } = useIndicadorCapitulos()
  const { indicadores } = useIndicadores()
  const { temas } = useTemasMateriais()
  const { temaIdsDoCapitulo, definirTemasDoCapitulo } = useCapituloTemasMateriais()
  const { topicosDoCapitulo, addTopico, updateTopico, deleteTopico } = useCapituloTopicos()
  const { entrevistas } = useEntrevistas()
  const { entrevistaIdsDoCapitulo, definirEntrevistasDoCapitulo } = useEntrevistaCapitulos()

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

  function toggleTema(cap: Capitulo, temaId: string) {
    const atuais = temaIdsDoCapitulo(cap.id)
    const proximos = atuais.includes(temaId) ? atuais.filter((id) => id !== temaId) : [...atuais, temaId]
    definirTemasDoCapitulo(cap.id, proximos)
  }

  function toggleEntrevista(cap: Capitulo, entrevistaId: string) {
    const atuais = entrevistaIdsDoCapitulo(cap.id)
    const proximos = atuais.includes(entrevistaId) ? atuais.filter((id) => id !== entrevistaId) : [...atuais, entrevistaId]
    definirEntrevistasDoCapitulo(cap.id, proximos)
  }

  const semDados = !loading && capitulos.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Relatório</h1>
          <p className="text-sm text-navy-700/70">
            Capítulos do relatório e o que cada um aborda. Os indicadores GRI refletem o que foi classificado em
            GRI — clique num indicador para ver status e andamento.
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
          description="Cadastre os capítulos do relatório e depois classifique indicadores, temas materiais e tópicos em cada um."
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
              .filter((i): i is Indicador => !!i)
            const total = indicadoresDoCapitulo.length
            const preenchidos = indicadoresDoCapitulo.filter((i) => STATUS_PREENCHIDO.includes(i.status)).length
            const aberto = expandido === cap.id
            const idsTemas = temaIdsDoCapitulo(cap.id)
            const temasDoCapitulo = idsTemas.map((id) => temas.find((t) => t.id === id)).filter((t): t is TemaMaterial => !!t)

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
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-navy-950">{cap.nome}</span>
                      <span className="text-xs text-navy-700/60">
                        {total} indicador{total === 1 ? '' : 'es'}
                      </span>
                      {temasDoCapitulo.map((t) => (
                        <span key={t.id} className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                          {t.nome}
                        </span>
                      ))}
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
                  <div className="flex flex-col gap-5 border-t border-navy-100 px-4 pb-5 pt-4">
                    <div>
                      <Label>Indicadores GRI deste capítulo</Label>
                      <p className="mb-2 text-xs text-navy-700/60">
                        Reflete o que foi classificado em cada indicador, na aba GRI. Clique num indicador para ver o
                        status e andamento.
                      </p>
                      {indicadoresDoCapitulo.length === 0 ? (
                        <p className="text-sm text-navy-700/60">
                          Nenhum indicador classificado neste capítulo ainda — classifique em GRI.
                        </p>
                      ) : (
                        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-lg border border-navy-100 p-2.5">
                          {indicadoresDoCapitulo.map((ind) => (
                            <Link
                              key={ind.id}
                              to={`/indicadores?abrir=${ind.id}`}
                              className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1.5 text-sm text-navy-950 hover:bg-navy-50"
                            >
                              <span className="flex items-center gap-2">
                                <span className="rounded-md bg-navy-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                                  {ind.codigo_gri}
                                </span>
                                {ind.titulo}
                              </span>
                              <StatusBadge status={ind.status} />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Temas materiais abordados (pode selecionar mais de um)</Label>
                      {temas.length === 0 ? (
                        <p className="text-sm text-navy-700/60">
                          Nenhum tema material cadastrado ainda — cadastre em Materialidade.
                        </p>
                      ) : (
                        <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-navy-100 p-2.5">
                          {temas.map((t) => (
                            <label key={t.id} className="flex items-center gap-2 text-sm text-navy-950">
                              <input type="checkbox" checked={idsTemas.includes(t.id)} onChange={() => toggleTema(cap, t.id)} />
                              {t.nome}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <TopicosDoCapitulo
                      capituloId={cap.id}
                      topicos={topicosDoCapitulo(cap.id)}
                      onAdd={addTopico}
                      onUpdate={updateTopico}
                      onDelete={deleteTopico}
                    />

                    <div>
                      <Label>Entrevistas relacionadas (pode selecionar mais de uma)</Label>
                      {entrevistas.length === 0 ? (
                        <p className="text-sm text-navy-700/60">
                          Nenhuma entrevista cadastrada ainda — cadastre em Entrevistas.
                        </p>
                      ) : (
                        <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-navy-100 p-2.5">
                          {entrevistas.map((ent) => (
                            <label key={ent.id} className="flex items-center gap-2 text-sm text-navy-950">
                              <input
                                type="checkbox"
                                checked={entrevistaIdsDoCapitulo(cap.id).includes(ent.id)}
                                onChange={() => toggleEntrevista(cap, ent.id)}
                              />
                              {ent.nome}
                              {ent.cargo && <span className="text-xs text-navy-700/60">({ent.cargo})</span>}
                            </label>
                          ))}
                        </div>
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
