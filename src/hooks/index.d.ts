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
  SaveNewPlayer(
    nickname: string,
    firstName: string,
    lastName: string,
    email: string,
  ): Promise<{status: string; data?: {playerId: number}; msg?: string}>
  GetUniquePlayers(): Promise<{data: Player[]}>
  AddPlayerToTeam(playerId: number, teamId: number): Promise<{status: string}>
}
export interface Match {
  GetMatchMetadata(matchId: number): Promise<MatchMetadata>
  ConfirmMatch(matchId: number, teamId: number): Promise<{status: string}>
  UnconfirmMatch(matchId: number, teamId: number): Promise<{status: string}>
  GetMatchDetails(matchId: number): Promise<MatchDetails>
}

export interface Teams {
  GetTeams(): Promise<Team[]>
  GetTeam(teamId: number): Promise<Team>
  GetTeamPlayers(teamId: number): Promise<Player[]>
  GetTeamMatches(teamId: number): Promise<Match[]>
  AddExistingPlayerToTeam(
    teamId: number,
    playerId: number,
  ): Promise<{status: string}>
}

export function useLeague(): League
export function useTeams(): Teams
export function usePlayers(): Player[]
export function useMatch(): Match
export function useLeague(): League
export function useTeams(): Team[]
export function usePlayers(): Player[]
export function useMatches(): Match[]
