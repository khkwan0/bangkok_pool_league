import type {ForumCategoryWithForums} from '@/types/forums'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useEffect, useState, useSyncExternalStore} from 'react'

export const FORUMS_LAST_SEEN_KEY = 'forums_last_seen_at'
export const FORUMS_TOPIC_BASELINE_KEY = 'forums_topic_baseline'
export const FORUMS_TOPIC_READS_KEY = 'forums_topic_reads'

type Listener = () => void

let hasNewForumPosts = false
let lastSeenMemory: string | null = null
let lastSeenLoaded = false
let seenGeneration = 0

let topicBaselineMemory: string | null = null
let topicBaselineLoaded = false
let topicReadsMemory: Record<string, string> = {}
let topicReadsLoaded = false
let topicActivityVersion = 0

const listeners = new Set<Listener>()
const topicListeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function emitTopicActivity() {
  topicActivityVersion += 1
  for (const listener of topicListeners) {
    listener()
  }
}

export function subscribeForumActivity(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function subscribeTopicActivity(listener: Listener) {
  topicListeners.add(listener)
  return () => {
    topicListeners.delete(listener)
  }
}

export function getHasNewForumPosts() {
  return hasNewForumPosts
}

export function setHasNewForumPosts(value: boolean) {
  if (hasNewForumPosts === value) {
    return
  }
  hasNewForumPosts = value
  emit()
}

export function useHasNewForumPosts() {
  return useSyncExternalStore(
    subscribeForumActivity,
    getHasNewForumPosts,
    () => false,
  )
}

export function getTopicActivityVersion() {
  return topicActivityVersion
}

export function useTopicActivityVersion() {
  return useSyncExternalStore(
    subscribeTopicActivity,
    getTopicActivityVersion,
    () => 0,
  )
}

export function latestForumPostAt(
  categories: ForumCategoryWithForums[],
): string | null {
  let latestMs = 0
  let latest: string | null = null
  for (const category of categories) {
    for (const forum of category.forums ?? []) {
      if (!forum.last_post_at) {
        continue
      }
      const ms = Date.parse(forum.last_post_at)
      if (!Number.isNaN(ms) && ms > latestMs) {
        latestMs = ms
        latest = forum.last_post_at
      }
    }
  }
  return latest
}

export function isNewerForumActivity(
  latestPostAt: string | null,
  lastSeenAt: string | null,
): boolean {
  if (!latestPostAt) {
    return false
  }
  const latestMs = Date.parse(latestPostAt)
  if (Number.isNaN(latestMs)) {
    return false
  }
  if (!lastSeenAt) {
    return true
  }
  const seenMs = Date.parse(lastSeenAt)
  if (Number.isNaN(seenMs)) {
    return true
  }
  return latestMs > seenMs
}

export async function getForumsLastSeenAt(): Promise<string | null> {
  if (lastSeenLoaded) {
    return lastSeenMemory
  }
  try {
    const stored = await AsyncStorage.getItem(FORUMS_LAST_SEEN_KEY)
    if (!lastSeenLoaded) {
      lastSeenMemory = stored
      lastSeenLoaded = true
    }
    return lastSeenMemory
  } catch {
    lastSeenLoaded = true
    return lastSeenMemory
  }
}

async function getTopicBaseline(): Promise<string | null> {
  if (topicBaselineLoaded) {
    return topicBaselineMemory
  }
  try {
    const stored = await AsyncStorage.getItem(FORUMS_TOPIC_BASELINE_KEY)
    if (!topicBaselineLoaded) {
      topicBaselineMemory = stored
      topicBaselineLoaded = true
    }
    return topicBaselineMemory
  } catch {
    topicBaselineLoaded = true
    return topicBaselineMemory
  }
}

async function getTopicReads(): Promise<Record<string, string>> {
  if (topicReadsLoaded) {
    return topicReadsMemory
  }
  try {
    const raw = await AsyncStorage.getItem(FORUMS_TOPIC_READS_KEY)
    if (!topicReadsLoaded) {
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>
        topicReadsMemory =
          parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed
            : {}
      } else {
        topicReadsMemory = {}
      }
      topicReadsLoaded = true
    }
    return topicReadsMemory
  } catch {
    topicReadsLoaded = true
    topicReadsMemory = {}
    return topicReadsMemory
  }
}

function laterTimestamp(a: string, b: string | null | undefined): string {
  if (!b) {
    return a
  }
  const aMs = Date.parse(a)
  const bMs = Date.parse(b)
  if (Number.isNaN(bMs)) {
    return a
  }
  if (Number.isNaN(aMs) || bMs > aMs) {
    return b
  }
  return a
}

export async function topicHasNewPosts(
  topicId: number,
  lastPostAt: string | null,
): Promise<boolean> {
  if (!lastPostAt) {
    return false
  }
  const [reads, baseline, lastSeen] = await Promise.all([
    getTopicReads(),
    getTopicBaseline(),
    getForumsLastSeenAt(),
  ])
  const threshold = reads[String(topicId)] ?? baseline ?? lastSeen
  if (!threshold) {
    return false
  }
  return isNewerForumActivity(lastPostAt, threshold)
}

export function useTopicHasNewPosts(
  topicId: number,
  lastPostAt: string | null,
) {
  const version = useTopicActivityVersion()
  const [hasNew, setHasNew] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const next = await topicHasNewPosts(topicId, lastPostAt)
      if (!cancelled) {
        setHasNew(next)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [topicId, lastPostAt, version])

  return hasNew
}

export async function markTopicSeen(
  topicId: number,
  lastPostAt?: string | null,
) {
  const reads = await getTopicReads()
  const key = String(topicId)
  const seenAt = laterTimestamp(
    laterTimestamp(new Date().toISOString(), lastPostAt),
    reads[key],
  )
  topicReadsMemory = {...reads, [key]: seenAt}
  topicReadsLoaded = true
  try {
    await AsyncStorage.setItem(
      FORUMS_TOPIC_READS_KEY,
      JSON.stringify(topicReadsMemory),
    )
  } catch (e) {
    console.error('Error saving forum topic reads:', e)
  }
  emitTopicActivity()
}

export async function markForumsSeen(latestPostAt?: string | null) {
  seenGeneration += 1
  await getForumsLastSeenAt()
  await getTopicBaseline()
  const previous = lastSeenMemory
  const now = new Date().toISOString()
  const seenAt = laterTimestamp(laterTimestamp(now, latestPostAt), previous)

  // Capture unread baseline once per visit from the prior lastSeen.
  // Skip on follow-up calls in the same visit (previous ≈ seenAt already).
  const previousMs = previous ? Date.parse(previous) : NaN
  const seenMs = Date.parse(seenAt)
  const shouldSetBaseline =
    previous == null
      ? !topicBaselineMemory
      : !Number.isNaN(previousMs) &&
        !Number.isNaN(seenMs) &&
        previousMs < seenMs - 1000

  if (shouldSetBaseline) {
    const nextBaseline = previous ?? seenAt
    topicBaselineMemory = nextBaseline
    topicBaselineLoaded = true
    try {
      await AsyncStorage.setItem(FORUMS_TOPIC_BASELINE_KEY, nextBaseline)
    } catch (e) {
      console.error('Error saving forums topic baseline:', e)
    }
  }

  lastSeenMemory = seenAt
  lastSeenLoaded = true
  setHasNewForumPosts(false)
  try {
    await AsyncStorage.setItem(FORUMS_LAST_SEEN_KEY, seenAt)
  } catch (e) {
    console.error('Error saving forums last seen:', e)
  }
  emitTopicActivity()
}

export async function refreshForumActivity(
  fetchLatestPostAt: () => Promise<string | null>,
) {
  const generation = seenGeneration
  try {
    const [latestPostAt, lastSeenAt] = await Promise.all([
      fetchLatestPostAt(),
      getForumsLastSeenAt(),
    ])
    if (generation !== seenGeneration) {
      return
    }
    setHasNewForumPosts(isNewerForumActivity(latestPostAt, lastSeenAt))
  } catch (e) {
    console.error('Error refreshing forum activity:', e)
  }
}
