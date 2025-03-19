import type {DivisionData} from '@/types'

export interface League {
  GetStandings(): Promise<DivisionData[]>
  GetCompletedMatchesByTeamId(
    teams: {id: number}[],
  ): Promise<{data: CompletedMatchType[]}>
  GrantPrivilege(
    playerId: number,
    teamId: number,
    level: number,
  ): Promise<{status: string}>
  RevokePrivileges(playerId: number, teamId: number): Promise<{status: string}>
  // Add other methods as needed
}

export function useLeague(): League
export function useTeams(): Team[]
export function usePlayers(): Player[]
export function useMatches(): Match[]
export function useLeague(): League
export function useTeams(): Team[]
export function usePlayers(): Player[]
export function useMatches(): Match[]
