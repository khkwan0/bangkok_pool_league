import {
  CANONICAL_COMPETITION,
  type Competition,
} from '@/types/competition'

type MiniLeagueRow = {
  id: number
  name: string
  member_status?: string | null
}

/**
 * Keep mini mode only when the user is an active member of that mini league.
 * Pending invites and missing ids fall back to canonical.
 */
export function validateCompetition(
  competition: Competition,
  miniLeagues: MiniLeagueRow[] | null | undefined,
): Competition {
  if (competition.type !== 'mini') {
    if (competition.type === 'tournament') return CANONICAL_COMPETITION
    return CANONICAL_COMPETITION
  }
  const found = (miniLeagues || []).find(m => Number(m.id) === competition.id)
  if (!found || found.member_status !== 'active') {
    return CANONICAL_COMPETITION
  }
  return {
    type: 'mini',
    id: Number(found.id),
    name: found.name || competition.name,
  }
}
