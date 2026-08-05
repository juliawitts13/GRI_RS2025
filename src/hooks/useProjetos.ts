import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Projeto, StatusProjeto } from '@/types/db'

export function useProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('projetos').select('*').order('created_at')
    if (!error) setProjetos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  function projetosDoTema(temaId: string): Projeto[] {
    return projetos.filter((p) => p.tema_material_id === temaId)
  }

  async function createProjeto(temaId: string, nome: string) {
    const { error } = await supabase.from('projetos').insert({ tema_material_id: temaId, nome })
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function updateProjeto(id: string, patch: { nome?: string; status?: StatusProjeto; descricao?: string | null }) {
    const { error } = await supabase.from('projetos').update(patch).eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deleteProjeto(id: string) {
    const { error } = await supabase.from('projetos').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { projetos, loading, refetch, projetosDoTema, createProjeto, updateProjeto, deleteProjeto }
}
