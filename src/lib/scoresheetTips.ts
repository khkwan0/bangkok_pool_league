import {
  frameHasCompleteRosters,
  getFinalizeBlockReason,
  resolveNoPlayers,
} from '@/lib/matchFormat'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const SHOW_SCORESHEET_TIPS_KEY = 'show_scoresheet_tips'
export const DISMISSED_SCORESHEET_TIPS_KEY = 'scoresheet_tips_dismissed'

export type ScoresheetTip = {
  id: string
  titleKey: string
  bodyKey: string
  params?: Record<string, string | number>
}

type TipFrame = {
  frameNumber?: number
  type?: string
  noPlayers?: number
  winner?: number
  homePlayerIds?: number[]
  awayPlayerIds?: number[]
}

export async function loadShowScoresheetTips(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SHOW_SCORESHEET_TIPS_KEY)
    if (!raw) return true
    const parsed = JSON.parse(raw)
    return typeof parsed?.show === 'boolean' ? parsed.show : true
  } catch {
    return true
  }
}

export async function saveShowScoresheetTips(show: boolean): Promise<void> {
  await AsyncStorage.setItem(
    SHOW_SCORESHEET_TIPS_KEY,
    JSON.stringify({show}),
  )
}

export async function loadDismissedScoresheetTips(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(DISMISSED_SCORESHEET_TIPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

export async function dismissScoresheetTip(tipId: string): Promise<string[]> {
  const current = await loadDismissedScoresheetTips()
  if (current.includes(tipId)) return current
  const next = [...current, tipId]
  await AsyncStorage.setItem(DISMISSED_SCORESHEET_TIPS_KEY, JSON.stringify(next))
  return next
}

function countAssigned(ids?: number[]): number {
  if (!Array.isArray(ids)) return 0
  return ids.filter(id => id != null && Number(id) > 0).length
}

export function buildWinPlayersRequiredTip(frame: {
  type?: string
  noPlayers?: number
  homePlayerIds?: number[]
  awayPlayerIds?: number[]
}): ScoresheetTip {
  const need = resolveNoPlayers(frame.type, null, frame.noPlayers)
  const home = countAssigned(frame.homePlayerIds)
  const away = countAssigned(frame.awayPlayerIds)
  const shortSides: string[] = []
  if (home < need) shortSides.push('home')
  if (away < need) shortSides.push('away')
  // Pool Win requires exact count; also flag over-filled as short for messaging.
  if (home !== need && !shortSides.includes('home')) shortSides.push('home')
  if (away !== need && !shortSides.includes('away')) shortSides.push('away')
  return {
    id: 'win_players_required',
    titleKey: 'players_required_title',
    bodyKey: 'players_required_message',
    params: {
      count: need,
      home,
      away,
      sides: shortSides.join(', '),
    },
  }
}

export function resolveScoresheetTip(args: {
  enabled: boolean
  dismissed: string[]
  override: ScoresheetTip | null
  frames: TipFrame[] | undefined | null
  format: unknown
  homeTeamId: number
  awayTeamId: number
  firstBreak?: number | null
}): ScoresheetTip | null {
  const {
    enabled,
    dismissed,
    override,
    frames,
    format,
    homeTeamId,
    awayTeamId,
    firstBreak,
  } = args
  if (!enabled) return null

  const allow = (tip: ScoresheetTip | null): ScoresheetTip | null => {
    if (!tip) return null
    if (dismissed.includes(tip.id)) return null
    return tip
  }

  if (override) {
    const shown = allow(override)
    if (shown) return shown
  }

  // Proactive: current unfinished frame short of players (same gate as Win).
  const playable = (frames ?? []).filter(
    f =>
      Number(f.frameNumber) > 0 &&
      f.type !== 'section' &&
      Number(f.frameNumber) !== -1,
  )
  const unfinished = playable.find(f => Number(f.winner ?? 0) <= 0)
  if (unfinished && !frameHasCompleteRosters(unfinished)) {
    const need = resolveNoPlayers(
      unfinished.type,
      null,
      unfinished.noPlayers,
    )
    const rosterTip = allow({
      id: 'frame_roster_incomplete',
      titleKey: 'tip_frame_roster_title',
      bodyKey: 'tip_frame_roster_body',
      params: {
        frame: Number(unfinished.frameNumber),
        count: need,
        home: countAssigned(unfinished.homePlayerIds),
        away: countAssigned(unfinished.awayPlayerIds),
      },
    })
    if (rosterTip) return rosterTip
  }

  const reason = getFinalizeBlockReason(
    frames ?? [],
    format,
    homeTeamId,
    awayTeamId,
    firstBreak,
  )
  if (reason) {
    return allow({
      id: reason.key,
      titleKey: 'tip_finalize_blocked_title',
      bodyKey: reason.key,
      params: reason.params,
    })
  }

  return null
}
