import type {DivisionData} from '@/types'

export interface League {
  GetStandings(): Promise<DivisionData[]>
  GetCompletedMatchesByTeamId(
    teams: {id: number}[],
  ): Promise<CompletedMatchType[]>
  // Add other methods as needed
}

export function useLeague(): League
