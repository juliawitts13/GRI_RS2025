import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { TemaMaterial } from '@/types/db'

export function useTemasMateriais() {
  const [temas, setTemas] = useState<TemaMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('temas_materiais').select('*').order('nome')
    if (!error) setTemas(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function createTema(nome: string, descricao: string | null) {
    const { error } = await supabase.from('temas_materiais').insert({ nome, descricao })
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function updateTema(id: string, patch: { nome?: string; descricao?: string | null }) {
    const { error } = await supabase.from('temas_materiais').update(patch).eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deleteTema(id: string) {
    const { error } = await supabase.from('temas_materiais').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { temas, loading, refetch, createTema, updateTema, deleteTema }
}
