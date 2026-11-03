import {useLeagueContext} from '@/context/LeagueContext'
import {useLiveScoresOptional} from '@/context/LiveScoresContext'
import {usePathname} from 'expo-router'
import {Platform} from 'react-native'

function useLiveScoresHomeGate(): boolean {
  const {state} = useLeagueContext()
  const live = useLiveScoresOptional()
  const pathname = usePathname() ?? ''
  const prefOn =
    typeof state.showLiveScores === 'undefined' || state.showLiveScores

  if (!prefOn || !live?.hasLiveScores) {
    return false
  }

  // Home tab root — upcoming matches (canonical or mini-league)
  return (
    pathname === '/' ||
    pathname === '' ||
    pathname === '/(tabs)/(index)' ||
    pathname.endsWith('/(index)') ||
    pathname.endsWith('/(index)/')
  )
}

/**
 * NativeTabs BottomAccessory live crawl (iOS 26+ only — no-op on Android/web).
 * Home tab upcoming matches screen only.
 */
export function useShowLiveScoresAccessory(): boolean {
  const gate = useLiveScoresHomeGate()
  return Platform.OS === 'ios' && gate
}

/**
 * In-page live crawl at the top of Home (Android/web — BottomAccessory is a no-op).
 */
export function useShowLiveScoresInPage(): boolean {
  const gate = useLiveScoresHomeGate()
  return Platform.OS !== 'ios' && gate
}
