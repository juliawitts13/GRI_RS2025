import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { IndicadorComentario } from '@/types/db'

export function useIndicadorComentarios(indicadorId: string | null) {
  const [comentarios, setComentarios] = useState<IndicadorComentario[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!indicadorId) {
      setComentarios([])
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('indicador_comentarios')
      .select('*')
      .eq('indicador_id', indicadorId)
      .order('data', { ascending: false })
      .order('criado_em', { ascending: false })
    if (!error) setComentarios(data ?? [])
    setLoading(false)
  }, [indicadorId])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addComentario(data: string, texto: string) {
    if (!indicadorId) return { error: 'Sem indicador selecionado' }
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
