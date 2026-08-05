import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Ods } from '@/types/db'

export function useOds() {
  const [ods, setOds] = useState<Ods[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('ods').select('*').order('numero')
    if (!error) setOds(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { ods, loading, refetch }
}
