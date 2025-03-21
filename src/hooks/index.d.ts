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
export interface Match {
  GetMatchMetadata(matchId: number): Promise<MatchMetadata>
  ConfirmMatch(matchId: number, teamId: number): Promise<{status: string}>
  UnconfirmMatch(matchId: number, teamId: number): Promise<{status: string}>
  GetMatchDetails(matchId: number): Promise<MatchDetails>
}

export function useLeague(): League
export function useTeams(): Team[]
export function usePlayers(): Player[]
export function useMatch(): Match
export function useLeague(): League
export function useTeams(): Team[]
export function usePlayers(): Player[]
export function useMatches(): Match[]
