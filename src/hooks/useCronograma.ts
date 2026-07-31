import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CronogramaTarefa } from '@/types/db'

export function useCronograma() {
  const [tarefas, setTarefas] = useState<CronogramaTarefa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('cronograma_tarefas')
      .select('*')
      .order('ordem')
      .then(({ data, error }) => {
        if (!error) setTarefas(data ?? [])
        setLoading(false)
      })
  }, [])

  return { tarefas, loading }
}
