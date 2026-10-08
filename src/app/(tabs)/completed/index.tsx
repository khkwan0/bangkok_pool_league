import CompletedMatchesOther from '@/components/Completed/CompletedMatchesOther'
import {MiniLeagueCompleted} from '@/components/mini-leagues/MiniLeagueCompleted'
import {useLeagueContext} from '@/context/LeagueContext'
import {useLeagueSeasonSelection} from '@/hooks/useLeagueSeasonSelection'
import {isMiniCompetition} from '@/types/competition'
import React from 'react'

export default function CompletedHome() {
  const {state} = useLeagueContext()
  const seasonSelection = useLeagueSeasonSelection()

  if (isMiniCompetition(state.competition)) {
    return <MiniLeagueCompleted miniLeagueId={state.competition.id} />
  }

  // Full season fixtures by week (completed + unfinished) so admins can
  // spot matches that still need finalizing.
  return <CompletedMatchesOther seasonSelection={seasonSelection} />
}
