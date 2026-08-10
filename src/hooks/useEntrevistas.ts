import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Entrevista, StatusEntrevista } from '@/types/db'

export type EntrevistaInput = {
  nome: string
  cargo: string | null
  status: StatusEntrevista
  data_agendada: string | null
  data_realizacao: string | null
  notas: string | null
  area_id: string | null
  marca: string | null
}

export function useEntrevistas() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('entrevistas').select('*').order('created_at')
    if (!error) setEntrevistas(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function createEntrevista(input: EntrevistaInput) {
    const { data, error } = await supabase.from('entrevistas').insert(input).select().single()
    if (!error) await refetch()
    return { entrevista: data, error: error?.message ?? null }
  }

  async function updateEntrevista(id: string, patch: Partial<EntrevistaInput>) {
    const { error } = await supabase.from('entrevistas').update(patch).eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deleteEntrevista(id: string) {
    const { error } = await supabase.from('entrevistas').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { entrevistas, loading, refetch, createEntrevista, updateEntrevista, deleteEntrevista }
}
