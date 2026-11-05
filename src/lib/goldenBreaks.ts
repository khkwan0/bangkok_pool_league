export type GoldenBreakEmphasis = 'hero' | 'featured' | 'recent' | 'earlier'

export type GoldenBreakPlayer = {
  playerId: number
  nickname: string
  pic: string | null
}

export type GoldenBreakItem = {
  frameId: number
  matchId: number
  matchDate: string
  frameNumber: number
  singles: boolean
  gameLabel: string
  divisionName: string | null
  seasonName: string | null
  homeTeamName: string
  awayTeamName: string
  homeTeamShortName: string
  awayTeamShortName: string
  winnerIsHome: boolean
  winnerTeamName: string
  opponentTeamName: string
  homeFrames: number
  awayFrames: number
  players: GoldenBreakPlayer[]
}

export type GoldenBreakList = {
  sport: 'pool' | 'darts'
  total: number
  limit: number
  offset: number
  items: GoldenBreakItem[]
}

/** Rank 0 is the newest golden break and should dominate the layout. */
export function goldenBreakEmphasis(rank: number): GoldenBreakEmphasis {
  if (rank <= 0) return 'hero'
  if (rank < 3) return 'featured'
  if (rank < 8) return 'recent'
  return 'earlier'
}
