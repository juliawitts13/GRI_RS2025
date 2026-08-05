import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { IndicadorPergunta } from '@/types/db'

export function useIndicadorPerguntas(indicadorId: string | null) {
  const [perguntas, setPerguntas] = useState<IndicadorPergunta[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!indicadorId) {
      setPerguntas([])
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('indicador_perguntas')
      .select('*')
      .eq('indicador_id', indicadorId)
      .order('ordem')
      .order('created_at')
    if (!error) setPerguntas(data ?? [])
    setLoading(false)
  }, [indicadorId])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addPergunta(texto: string) {
    if (!indicadorId) return { error: 'Sem indicador selecionado' }
    const { error } = await supabase.from('indicador_perguntas').insert({ indicador_id: indicadorId, texto })
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function updatePergunta(id: string, patch: { texto?: string; respondida?: boolean }) {
    const { error } = await supabase.from('indicador_perguntas').update(patch).eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deletePergunta(id: string) {
    const { error } = await supabase.from('indicador_perguntas').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { perguntas, loading, addPergunta, updatePergunta, deletePergunta }
}
