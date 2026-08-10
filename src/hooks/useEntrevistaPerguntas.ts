import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { EntrevistaPergunta, StatusEntrevistaPergunta } from '@/types/db'

export function useEntrevistaPerguntas(entrevistaId: string | null) {
  const [perguntas, setPerguntas] = useState<EntrevistaPergunta[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!entrevistaId) {
      setPerguntas([])
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('entrevista_perguntas')
      .select('*')
      .eq('entrevista_id', entrevistaId)
      .order('ordem')
      .order('created_at')
    if (!error) setPerguntas(data ?? [])
    setLoading(false)
  }, [entrevistaId])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addPergunta(texto: string) {
    if (!entrevistaId) return { error: 'Sem entrevista selecionada' }
    const { error } = await supabase.from('entrevista_perguntas').insert({ entrevista_id: entrevistaId, texto })
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function updatePergunta(id: string, patch: { texto?: string; status?: StatusEntrevistaPergunta }) {
    const { error } = await supabase.from('entrevista_perguntas').update(patch).eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deletePergunta(id: string) {
    const { error } = await supabase.from('entrevista_perguntas').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { perguntas, loading, addPergunta, updatePergunta, deletePergunta }
}
