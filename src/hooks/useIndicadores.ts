import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Indicador, StatusIndicador } from '@/types/db'

export type IndicadorInput = {
  codigo_gri: string
  titulo: string
  area_id: string | null
  respondente_id: string | null
  status: StatusIndicador
  prazo: string | null
  ficha_conteudo: string | null
}

export function useIndicadores() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('indicadores').select('*').order('codigo_gri')
    if (!error) setIndicadores(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function createIndicador(input: IndicadorInput) {
    const { error } = await supabase.from('indicadores').insert(input)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function updateIndicador(id: string, input: Partial<IndicadorInput>) {
    const { error } = await supabase
      .from('indicadores')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deleteIndicador(id: string) {
    const { error } = await supabase.from('indicadores').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function upsertManyByCodigo(inputs: IndicadorInput[]) {
    const { error } = await supabase.from('indicadores').upsert(inputs, { onConflict: 'codigo_gri' })
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return {
    indicadores,
    loading,
    refetch,
    createIndicador,
    updateIndicador,
    deleteIndicador,
    upsertManyByCodigo,
  }
}
