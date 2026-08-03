import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { IndicadorComentario } from '@/types/db'

/** Todos os comentários/histórico de cobrança, de todos os indicadores — para visões agregadas (ex: por área). */
export function useComentarios() {
  const [comentarios, setComentarios] = useState<IndicadorComentario[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('indicador_comentarios')
      .select('*')
      .order('data', { ascending: false })
      .order('criado_em', { ascending: false })
    if (!error) setComentarios(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addComentario(indicadorId: string, data: string, texto: string) {
    const { error } = await supabase.from('indicador_comentarios').insert({ indicador_id: indicadorId, data, texto })
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deleteComentario(id: string) {
    const { error } = await supabase.from('indicador_comentarios').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { comentarios, loading, addComentario, deleteComentario }
}
