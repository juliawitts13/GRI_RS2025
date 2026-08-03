import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Area } from '@/types/db'

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('areas').select('*').order('nome')
    if (!error) setAreas(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function createArea(nome: string) {
    const { error } = await supabase.from('areas').insert({ nome })
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function updateArea(id: string, patch: { nome?: string; validador_id?: string | null }) {
    const { error } = await supabase.from('areas').update(patch).eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deleteArea(id: string) {
    const { error } = await supabase.from('areas').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { areas, loading, refetch, createArea, updateArea, deleteArea }
}
