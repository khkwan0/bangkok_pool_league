import {useNetwork} from '@/hooks/useNetwork'
import type {GoldenBreakList} from '@/lib/goldenBreaks'
import React from 'react'

export function useGoldenBreaks() {
  const network = useNetwork()
  const networkRef = React.useRef(network)
  networkRef.current = network

  const getGoldenBreaks = React.useCallback(
    async (opts?: {
      q?: string | null
      seasonId?: number | null
      limit?: number
      offset?: number
    }): Promise<GoldenBreakList | null> => {
      const params = new URLSearchParams()
      const q = (opts?.q || '').trim()
      if (q) params.set('q', q)
      if (opts?.seasonId != null && opts.seasonId > 0) {
        params.set('season', String(opts.seasonId))
      }
      if (opts?.limit != null) params.set('limit', String(opts.limit))
      if (opts?.offset != null && opts.offset > 0) {
        params.set('offset', String(opts.offset))
      }
      const qs = params.toString()
      const path = qs ? `/golden-breaks?${qs}` : '/golden-breaks'
      const res = await networkRef.current.Get(path)
      if (!res || res.status === 'error' || res.httpStatus) return null
      if (!res || !Array.isArray(res.items)) return null
      return res as GoldenBreakList
    },
    [],
  )

  return {getGoldenBreaks}
}
