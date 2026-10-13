export type WeeklyHighlightPlayer = {
  playerId: number
  nickname: string
  pic: string | null
  team: {id: number; name: string; shortName: string | null} | null
  played: number
  won: number
  lost: number
  winPct: number
}

export type WeeklySpotlight = {
  id: string
  label: string
  player: WeeklyHighlightPlayer
  value: number
  detail: string
}

export type WeeklyHighlights = {
  matchDate: string
  seasonId: number
  leagueId: number
  sport: string
  playerOfTheWeek: WeeklyHighlightPlayer & {
    source: 'auto' | 'override'
    note: string | null
  }
  spotlights: WeeklySpotlight[]
  autoPlayerId: number
}
