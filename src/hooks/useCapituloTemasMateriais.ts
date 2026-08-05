import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CapituloTemaMaterial } from '@/types/db'

export function useCapituloTemasMateriais() {
  const [vinculos, setVinculos] = useState<CapituloTemaMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('capitulo_temas_materiais').select('*')
    if (!error) setVinculos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  function temaIdsDoCapitulo(capituloId: string): string[] {
    return vinculos.filter((v) => v.capitulo_id === capituloId).map((v) => v.tema_material_id)
  }

  function capituloIdsDoTema(temaId: string): string[] {
    return vinculos.filter((v) => v.tema_material_id === temaId).map((v) => v.capitulo_id)
  }

  /** Substitui todos os temas materiais de um capítulo pela lista informada. */
  async function definirTemasDoCapitulo(capituloId: string, temaIds: string[]) {
    await supabase.from('capitulo_temas_materiais').delete().eq('capitulo_id', capituloId)
    if (temaIds.length > 0) {
      const { error } = await supabase
        .from('capitulo_temas_materiais')
        .insert(temaIds.map((tema_material_id) => ({ capitulo_id: capituloId, tema_material_id })))
      if (error) {
        await refetch()
        return { error: error.message }
      }
    }
    await refetch()
    return { error: null }
  }

  return { vinculos, loading, refetch, temaIdsDoCapitulo, capituloIdsDoTema, definirTemasDoCapitulo }
}
