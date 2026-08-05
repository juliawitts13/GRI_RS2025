import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CapituloTopico } from '@/types/db'

export function useCapituloTopicos() {
  const [topicos, setTopicos] = useState<CapituloTopico[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('capitulo_topicos').select('*').order('ordem').order('created_at')
    if (!error) setTopicos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  function topicosDoCapitulo(capituloId: string): CapituloTopico[] {
    return topicos.filter((t) => t.capitulo_id === capituloId)
  }

  async function addTopico(capituloId: string, texto: string) {
    const { error } = await supabase.from('capitulo_topicos').insert({ capitulo_id: capituloId, texto })
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function updateTopico(id: string, texto: string) {
    const { error } = await supabase.from('capitulo_topicos').update({ texto }).eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  async function deleteTopico(id: string) {
    const { error } = await supabase.from('capitulo_topicos').delete().eq('id', id)
    if (!error) await refetch()
    return { error: error?.message ?? null }
  }

  return { topicos, loading, refetch, topicosDoCapitulo, addTopico, updateTopico, deleteTopico }
}
