import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { IndicadorRespondente } from '@/types/db'

export function useIndicadorRespondentes() {
  const [vinculos, setVinculos] = useState<IndicadorRespondente[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('indicador_respondentes').select('*')
    if (!error) setVinculos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  function respondenteIdsDoIndicador(indicadorId: string): string[] {
    return vinculos.filter((v) => v.indicador_id === indicadorId).map((v) => v.respondente_id)
  }

  /** Substitui todos os respondentes de um indicador pela lista informada. */
  async function definirRespondentes(indicadorId: string, respondenteIds: string[]) {
    await supabase.from('indicador_respondentes').delete().eq('indicador_id', indicadorId)
    if (respondenteIds.length > 0) {
      const { error } = await supabase
        .from('indicador_respondentes')
        .insert(respondenteIds.map((respondente_id) => ({ indicador_id: indicadorId, respondente_id })))
      if (error) {
        await refetch()
        return { error: error.message }
      }
    }
    await refetch()
    return { error: null }
  }

  /** Adiciona um respondente a vários indicadores de uma vez, sem remover os que já existiam. */
  async function adicionarRespondenteEmLote(indicadorIds: string[], respondenteId: string) {
    const linhas = indicadorIds
      .filter((id) => !respondenteIdsDoIndicador(id).includes(respondenteId))
      .map((indicador_id) => ({ indicador_id, respondente_id: respondenteId }))
    if (linhas.length === 0) return { error: null }
    const { error } = await supabase.from('indicador_respondentes').insert(linhas)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { vinculos, loading, refetch, respondenteIdsDoIndicador, definirRespondentes, adicionarRespondenteEmLote }
}
