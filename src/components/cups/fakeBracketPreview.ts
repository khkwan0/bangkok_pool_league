/**
 * TEMP UI preview only — delete this file and its imports when done.
 * Flip USE_FAKE_32_BRACKET to false to disable without deleting.
 */
import type {BracketTreeMatch, BracketTreeStage} from './BracketTree'

/** Set false (or delete this module) to stop injecting fake bracket data. */
export const USE_FAKE_32_BRACKET = true

function playerName(seed: number): string {
  return `Player ${seed}`
}

/**
 * Single-elim 32-entry bracket: R1=16 … Final=1 (31 matches).
 */
export function buildFake32PlayerStages(): BracketTreeStage[] {
  const matches: BracketTreeMatch[] = []
  let matchId = 900001
  let position = 0

  // Round 1: 16 matches, seeds 1–32
  for (let i = 0; i < 16; i++) {
    const homeSeed = i + 1
    const awaySeed = 33 - homeSeed
    position += 1
    const tempId = `fake-r1-p${i}`
    matches.push({
      match_id: matchId++,
      temp_id: tempId,
      bracket_side: 'winners',
      round: 1,
      position,
      home_display: playerName(homeSeed),
      away_display: playerName(awaySeed),
      home_entry_id: homeSeed,
      away_entry_id: awaySeed,
      status_id: 1,
      home_frames: null,
      away_frames: null,
      home_tournament_team_id: 1000 + homeSeed,
      away_tournament_team_id: 1000 + awaySeed,
    })
  }

  // Later rounds: TBD slots so the tree width/height is visible
  const laterRounds: Array<{round: number; count: number}> = [
    {round: 2, count: 8},
    {round: 3, count: 4},
    {round: 4, count: 2},
    {round: 5, count: 1},
  ]
  for (const {round, count} of laterRounds) {
    for (let i = 0; i < count; i++) {
      position += 1
      matches.push({
        match_id: matchId++,
        temp_id: `fake-r${round}-p${i}`,
        bracket_side: 'winners',
        round,
        position,
        home_display: null,
        away_display: null,
        status_id: 0,
        home_frames: null,
        away_frames: null,
      })
    }
  }

  return [
    {
      stage_key: 'fake_main',
      label: 'Main draw (FAKE 32)',
      stage_order: 1,
      matches,
    },
  ]
}

/** Local-only swap for fake preview (no API). */
export function swapFakeRound1Slots(
  stages: BracketTreeStage[],
  from: {temp_id: string; slot: 'home' | 'away'},
  to: {temp_id: string; slot: 'home' | 'away'},
): BracketTreeStage[] {
  const next = stages.map(stage => ({
    ...stage,
    matches: stage.matches.map(m => ({...m})),
  }))
  const all = next.flatMap(s => s.matches)
  const a = all.find(m => m.temp_id === from.temp_id && m.round === 1)
  const b = all.find(m => m.temp_id === to.temp_id && m.round === 1)
  if (!a || !b) return stages

  const read = (m: BracketTreeMatch, slot: 'home' | 'away') =>
    slot === 'home'
      ? {
          display: m.home_display,
          entry: m.home_entry_id ?? null,
          team: m.home_tournament_team_id ?? null,
        }
      : {
          display: m.away_display,
          entry: m.away_entry_id ?? null,
          team: m.away_tournament_team_id ?? null,
        }
  const write = (
    m: BracketTreeMatch,
    slot: 'home' | 'away',
    v: {display: string | null; entry: number | null; team: number | null},
  ) => {
    if (slot === 'home') {
      m.home_display = v.display
      m.home_entry_id = v.entry
      m.home_tournament_team_id = v.team
    } else {
      m.away_display = v.display
      m.away_entry_id = v.entry
      m.away_tournament_team_id = v.team
    }
  }

  const av = read(a, from.slot)
  const bv = read(b, to.slot)
  write(a, from.slot, bv)
  write(b, to.slot, av)
  return next
}
