import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { IndicadorCapitulo } from '@/types/db'

export function useIndicadorCapitulos() {
  const [vinculos, setVinculos] = useState<IndicadorCapitulo[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('indicador_capitulos').select('*')
    if (!error) setVinculos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  function capituloIdsDoIndicador(indicadorId: string): string[] {
    return vinculos.filter((v) => v.indicador_id === indicadorId).map((v) => v.capitulo_id)
  }

  function indicadorIdsDoCapitulo(capituloId: string): string[] {
    return vinculos.filter((v) => v.capitulo_id === capituloId).map((v) => v.indicador_id)
  }

  /** Substitui todos os capítulos de um indicador pela lista informada. */
  async function definirCapitulos(indicadorId: string, capituloIds: string[]) {
    await supabase.from('indicador_capitulos').delete().eq('indicador_id', indicadorId)
    if (capituloIds.length > 0) {
      const { error } = await supabase
        .from('indicador_capitulos')
        .insert(capituloIds.map((capitulo_id) => ({ indicador_id: indicadorId, capitulo_id })))
      if (error) {
        await refetch()
        return { error: error.message }
      }
    }
    await refetch()
    return { error: null }
  }

  /** Substitui todos os indicadores de um capítulo pela lista informada. */
  async function definirIndicadoresDoCapitulo(capituloId: string, indicadorIds: string[]) {
    await supabase.from('indicador_capitulos').delete().eq('capitulo_id', capituloId)
    if (indicadorIds.length > 0) {
      const { error } = await supabase
        .from('indicador_capitulos')
        .insert(indicadorIds.map((indicador_id) => ({ indicador_id, capitulo_id: capituloId })))
      if (error) {
        await refetch()
        return { error: error.message }
      }
    }
    await refetch()
    return { error: null }
  }

  return {
    vinculos,
    loading,
    refetch,
    capituloIdsDoIndicador,
    indicadorIdsDoCapitulo,
    definirCapitulos,
    definirIndicadoresDoCapitulo,
  }
}
