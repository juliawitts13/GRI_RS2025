import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Respondente } from '@/types/db'

export type RespondenteInput = {
  nome: string
  email: string | null
  area_id: string | null
  ativo: boolean
  eh_respondente: boolean
  eh_validador: boolean
}

export function useRespondentes() {
  const [respondentes, setRespondentes] = useState<Respondente[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('respondentes').select('*').order('nome')
    if (!error) setRespondentes(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function createRespondente(input: RespondenteInput) {
    const { error } = await supabase.from('respondentes').insert(input)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function updateRespondente(id: string, input: Partial<RespondenteInput>) {
    const { error } = await supabase
      .from('respondentes')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deleteRespondente(id: string) {
    const { error } = await supabase.from('respondentes').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { respondentes, loading, refetch, createRespondente, updateRespondente, deleteRespondente }
}
