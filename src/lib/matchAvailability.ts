export type AvailabilityStatus = 'in' | 'out'

export type AvailabilityCounts = {
  in: number
  out: number
  pending: number
}

export type AvailabilityPrompt = {
  matchId: number
  teamId: number
  isCaptain: boolean
  mine: AvailabilityStatus | null
  note: string | null
  counts: AvailabilityCounts | null
}

type Getter = (path: string) => Promise<any>

type Cache = {
  userId: number
  prompts: Map<number, AvailabilityPrompt>
  at: number
}

let cache: Cache | null = null
let inflight: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach(listener => listener())
}

export function subscribeAvailability(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function availabilityPrompt(matchId: number): AvailabilityPrompt | null {
  return cache?.prompts.get(matchId) ?? null
}

export function writeAvailabilityPrompt(
  userId: number,
  prompt: AvailabilityPrompt,
) {
  if (!cache || cache.userId !== userId) {
    cache = {userId, prompts: new Map(), at: Date.now()}
  }
  cache.prompts.set(Number(prompt.matchId), {
    ...prompt,
    matchId: Number(prompt.matchId),
  })
  cache.at = Date.now()
  emit()
}

export function refreshAvailability(
  get: Getter,
  userId: number,
  force = false,
) {
  if (!userId) return Promise.resolve()
  if (inflight) return inflight
  if (
    !force &&
    cache &&
    cache.userId === userId &&
    Date.now() - cache.at < 15000
  ) {
    return Promise.resolve()
  }
  inflight = (async () => {
    const res = await get('/match-availability')
    if (res?.status !== 'ok' || !Array.isArray(res.prompts)) return
    const prompts = new Map<number, AvailabilityPrompt>()
    for (const prompt of res.prompts as AvailabilityPrompt[]) {
      prompts.set(Number(prompt.matchId), {
        ...prompt,
        matchId: Number(prompt.matchId),
      })
    }
    cache = {userId, prompts, at: Date.now()}
    emit()
  })().finally(() => {
    inflight = null
  })
  return inflight
}
