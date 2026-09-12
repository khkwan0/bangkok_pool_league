export type Competition =
  | {type: 'canonical'}
  | {type: 'mini'; id: number; name: string}
  | {type: 'tournament'; id: number; name: string}

export const CANONICAL_COMPETITION: Competition = {type: 'canonical'}

export const COMPETITION_STORAGE_KEY = 'competition_v1'

/** Accent used whenever the app is not in Bangkok Pool League mode */
export const NON_CANONICAL_ACCENT = '#C2185B'
export const NON_CANONICAL_ACCENT_SOFT = '#FCE4EC'
export const NON_CANONICAL_ACCENT_DARK = '#4A0D2A'
export const NON_CANONICAL_ACCENT_SOFT_DARK = '#3B1024'

export function isCanonicalCompetition(competition: Competition): boolean {
  return competition.type === 'canonical'
}

export function competitionModeLabel(competition: Competition): string | null {
  if (competition.type === 'mini') return 'MINI LEAGUE'
  if (competition.type === 'tournament') return 'TOURNAMENT'
  return null
}

export function competitionDisplayName(
  competition: Competition,
  canonicalLabel = 'Bangkok Pool League',
): string {
  if (competition.type === 'canonical') return canonicalLabel
  return competition.name
}

export function isMiniCompetition(
  competition: Competition,
): competition is Extract<Competition, {type: 'mini'}> {
  return competition.type === 'mini'
}

export function parseStoredCompetition(raw: string | null): Competition {
  if (!raw) return CANONICAL_COMPETITION
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.type === 'canonical') return CANONICAL_COMPETITION
    if (
      parsed?.type === 'mini' &&
      typeof parsed.id === 'number' &&
      parsed.id > 0 &&
      typeof parsed.name === 'string'
    ) {
      return {type: 'mini', id: parsed.id, name: parsed.name}
    }
    if (
      parsed?.type === 'tournament' &&
      typeof parsed.id === 'number' &&
      parsed.id > 0 &&
      typeof parsed.name === 'string'
    ) {
      return {type: 'tournament', id: parsed.id, name: parsed.name}
    }
  } catch {
    // fall through
  }
  return CANONICAL_COMPETITION
}
