import {useLeagueContext} from '@/context/LeagueContext'
import {useNetwork} from '@/hooks/useNetwork'
import type {GoldenBreakList} from '@/lib/goldenBreaks'
import {
  applyGoldenBreakReadSnapshot,
  clearGoldenBreakReads,
  getGoldenBreakReadSnapshot,
  parseGoldenBreakReadSnapshot,
  subscribeGoldenBreakReads,
  type GoldenBreakReadSnapshot,
} from '@/lib/goldenBreakReads'
import {useFocusEffect} from 'expo-router'
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

let readSeq = 0

async function loadGoldenBreakReads(get: (path: string) => Promise<any>) {
  const ticket = ++readSeq
  try {
    const res = await get('/golden-breaks/reads')
    if (ticket !== readSeq) return
    const parsed = parseGoldenBreakReadSnapshot(res?.data)
    if (res?.status === 'ok' && parsed) applyGoldenBreakReadSnapshot(parsed)
  } catch {
    // Keep the last known badges if the read state cannot be loaded.
  }
}

async function markGoldenBreaksRead(
  post: (path: string, body: object) => Promise<any>,
) {
  const ticket = ++readSeq
  try {
    const res = await post('/golden-breaks/reads', {})
    if (ticket !== readSeq) return
    const parsed = parseGoldenBreakReadSnapshot(res?.data)
    if (res?.status === 'ok' && parsed) applyGoldenBreakReadSnapshot(parsed)
  } catch {
    // Leave the badges in place so a failed save can be retried.
  }
}

export function useGoldenBreakReads(): GoldenBreakReadSnapshot {
  const network = useNetwork()
  const networkRef = React.useRef(network)
  networkRef.current = network
  const {state} = useLeagueContext()
  const userId = state.user?.id
  const sport = state.sport
  const reads = React.useSyncExternalStore(
    subscribeGoldenBreakReads,
    getGoldenBreakReadSnapshot,
    () => getGoldenBreakReadSnapshot(),
  )

  const refresh = React.useCallback(() => {
    if (sport === 'darts' || userId == null) {
      clearGoldenBreakReads()
      return
    }
    void loadGoldenBreakReads(path => networkRef.current.Get(path))
  }, [sport, userId])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  useFocusEffect(
    React.useCallback(() => {
      refresh()
    }, [refresh]),
  )

  return reads
}

export function useMarkGoldenBreaksRead() {
  const network = useNetwork()
  const networkRef = React.useRef(network)
  networkRef.current = network
  const {state} = useLeagueContext()
  const userId = state.user?.id
  const sport = state.sport

  return React.useCallback(() => {
    if (sport === 'darts' || userId == null) return
    void markGoldenBreaksRead((path, body) => networkRef.current.Post(path, body))
  }, [sport, userId])
}
