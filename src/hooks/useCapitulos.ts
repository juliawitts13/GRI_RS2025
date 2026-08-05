import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Capitulo } from '@/types/db'

export function useCapitulos() {
  const [capitulos, setCapitulos] = useState<Capitulo[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('capitulos').select('*').order('ordem').order('nome')
    if (!error) setCapitulos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function createCapitulo(nome: string, ordem: number | null) {
    const { error } = await supabase.from('capitulos').insert({ nome, ordem })
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function updateCapitulo(id: string, patch: { nome?: string; ordem?: number | null }) {
    const { error } = await supabase.from('capitulos').update(patch).eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deleteCapitulo(id: string) {
    const { error } = await supabase.from('capitulos').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { capitulos, loading, refetch, createCapitulo, updateCapitulo, deleteCapitulo }
}
