import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { TemaMaterialOds } from '@/types/db'

export function useTemaMaterialOds() {
  const [vinculos, setVinculos] = useState<TemaMaterialOds[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('tema_material_ods').select('*')
    if (!error) setVinculos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  function odsIdsDoTema(temaId: string): number[] {
    return vinculos.filter((v) => v.tema_material_id === temaId).map((v) => v.ods_id)
  }

  /** Substitui todos os ODS de um tema material pela lista informada. */
  async function definirOdsDoTema(temaId: string, odsIds: number[]) {
    await supabase.from('tema_material_ods').delete().eq('tema_material_id', temaId)
    if (odsIds.length > 0) {
      const { error } = await supabase
        .from('tema_material_ods')
        .insert(odsIds.map((ods_id) => ({ tema_material_id: temaId, ods_id })))
      if (error) {
        await refetch()
        return { error: error.message }
      }
    }
    await refetch()
    return { error: null }
  }

  return { vinculos, loading, refetch, odsIdsDoTema, definirOdsDoTema }
}
