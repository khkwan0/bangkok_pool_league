export type GoldenBreakReadSnapshot = {
  hasCursor: boolean
  readThroughFrameId: number
  unreadCount: number
  unreadFrameIds: number[]
}

export const EMPTY_GOLDEN_BREAK_READS: GoldenBreakReadSnapshot = {
  hasCursor: false,
  readThroughFrameId: 0,
  unreadCount: 0,
  unreadFrameIds: [],
}

type Listener = () => void

let snapshot: GoldenBreakReadSnapshot = EMPTY_GOLDEN_BREAK_READS
const listeners = new Set<Listener>()

function emit(next: GoldenBreakReadSnapshot) {
  snapshot = next
  for (const listener of listeners) listener()
}

export function subscribeGoldenBreakReads(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getGoldenBreakReadSnapshot() {
  return snapshot
}

export function goldenBreakIsUnread(
  frameId: number,
  reads: GoldenBreakReadSnapshot = snapshot,
): boolean {
  if (reads.unreadCount <= 0 || !Number.isFinite(frameId) || frameId <= 0) {
    return false
  }
  if (reads.hasCursor) return frameId > reads.readThroughFrameId
  return reads.unreadFrameIds.includes(frameId)
}

export function applyGoldenBreakReadSnapshot(next: GoldenBreakReadSnapshot) {
  emit(next)
}

export function clearGoldenBreakReads() {
  if (
    snapshot.unreadCount === 0 &&
    !snapshot.hasCursor &&
    snapshot.unreadFrameIds.length === 0
  ) {
    return
  }
  emit(EMPTY_GOLDEN_BREAK_READS)
}

export function parseGoldenBreakReadSnapshot(
  value: unknown,
): GoldenBreakReadSnapshot | null {
  if (!value || typeof value !== 'object') return null
  const row = value as {
    hasCursor?: unknown
    readThroughFrameId?: unknown
    unreadCount?: unknown
    unreadFrameIds?: unknown
  }
  const unreadFrameIds = Array.isArray(row.unreadFrameIds)
    ? row.unreadFrameIds
        .map(id => Number(id))
        .filter(id => Number.isFinite(id) && id > 0)
    : []
  const unreadCount = Number(row.unreadCount)
  const readThroughFrameId = Number(row.readThroughFrameId)
  return {
    hasCursor: row.hasCursor === true,
    readThroughFrameId: Number.isFinite(readThroughFrameId)
      ? readThroughFrameId
      : 0,
    unreadCount: Number.isFinite(unreadCount) ? unreadCount : unreadFrameIds.length,
    unreadFrameIds,
  }
}
