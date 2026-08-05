import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { IndicadorTemaMaterial } from '@/types/db'

export function useIndicadorTemasMateriais() {
  const [vinculos, setVinculos] = useState<IndicadorTemaMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('indicador_temas_materiais').select('*')
    if (!error) setVinculos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  function temaIdsDoIndicador(indicadorId: string): string[] {
    return vinculos.filter((v) => v.indicador_id === indicadorId).map((v) => v.tema_material_id)
  }

  function indicadorIdsDoTema(temaId: string): string[] {
    return vinculos.filter((v) => v.tema_material_id === temaId).map((v) => v.indicador_id)
  }

  /** Substitui todos os temas materiais de um indicador pela lista informada. */
  async function definirTemas(indicadorId: string, temaIds: string[]) {
    await supabase.from('indicador_temas_materiais').delete().eq('indicador_id', indicadorId)
    if (temaIds.length > 0) {
      const { error } = await supabase
        .from('indicador_temas_materiais')
        .insert(temaIds.map((tema_material_id) => ({ indicador_id: indicadorId, tema_material_id })))
      if (error) {
        await refetch()
        return { error: error.message }
      }
    }
    await refetch()
    return { error: null }
  }

  return { vinculos, loading, refetch, temaIdsDoIndicador, indicadorIdsDoTema, definirTemas }
}
