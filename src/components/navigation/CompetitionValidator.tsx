import {useLeagueContext} from '@/context/LeagueContext'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {validateCompetition} from '@/lib/competitionValidation'
import {CANONICAL_COMPETITION} from '@/types/competition'
import React from 'react'

/**
 * Re-validates persisted mini competition when the signed-in user changes.
 * Renders nothing; mount once under the tab shell.
 */
export function CompetitionValidator() {
  const {state, setCompetition, apiUrl} = useLeagueContext()
  const api = useMiniLeagues()
  const apiRef = React.useRef(api)
  apiRef.current = api
  const userId = state.user?.id
  const competition = state.competition

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      if (!userId) {
        if (competition.type !== 'canonical') {
          await setCompetition(CANONICAL_COMPETITION)
        }
        return
      }
      if (competition.type !== 'mini') return
      const res = await apiRef.current.list()
      if (cancelled) return
      const list =
        res?.status === 'ok' && Array.isArray(res.data) ? res.data : []
      // If the list call failed (wrong host / unauthorized), don't wipe selection
      if (res?.status !== 'ok') return
      const next = validateCompetition(competition, list)
      if (
        next.type !== competition.type ||
        (next.type === 'mini' &&
          competition.type === 'mini' &&
          (next.id !== competition.id || next.name !== competition.name))
      ) {
        await setCompetition(next)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [
    userId,
    competition,
    setCompetition,
    apiUrl,
  ])

  return null
}
