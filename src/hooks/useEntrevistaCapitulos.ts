import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { EntrevistaCapitulo } from '@/types/db'

export function useEntrevistaCapitulos() {
  const [vinculos, setVinculos] = useState<EntrevistaCapitulo[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('entrevista_capitulos').select('*')
    if (!error) setVinculos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  function capituloIdsDaEntrevista(entrevistaId: string): string[] {
    return vinculos.filter((v) => v.entrevista_id === entrevistaId).map((v) => v.capitulo_id)
  }

  function entrevistaIdsDoCapitulo(capituloId: string): string[] {
    return vinculos.filter((v) => v.capitulo_id === capituloId).map((v) => v.entrevista_id)
  }

  /** Substitui todos os capítulos de uma entrevista pela lista informada. */
  async function definirCapitulosDaEntrevista(entrevistaId: string, capituloIds: string[]) {
    await supabase.from('entrevista_capitulos').delete().eq('entrevista_id', entrevistaId)
    if (capituloIds.length > 0) {
      const { error } = await supabase
        .from('entrevista_capitulos')
        .insert(capituloIds.map((capitulo_id) => ({ entrevista_id: entrevistaId, capitulo_id })))
      if (error) {
        await refetch()
        return { error: error.message }
      }
    }
    await refetch()
    return { error: null }
  }

  /** Substitui todas as entrevistas de um capítulo pela lista informada. */
  async function definirEntrevistasDoCapitulo(capituloId: string, entrevistaIds: string[]) {
    await supabase.from('entrevista_capitulos').delete().eq('capitulo_id', capituloId)
    if (entrevistaIds.length > 0) {
      const { error } = await supabase
        .from('entrevista_capitulos')
        .insert(entrevistaIds.map((entrevista_id) => ({ entrevista_id, capitulo_id: capituloId })))
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
    capituloIdsDaEntrevista,
    entrevistaIdsDoCapitulo,
    definirCapitulosDaEntrevista,
    definirEntrevistasDoCapitulo,
  }
}
