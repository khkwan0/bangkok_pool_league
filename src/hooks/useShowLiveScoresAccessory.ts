import {useLeagueContext} from '@/context/LeagueContext'
import {useLiveScoresOptional} from '@/context/LiveScoresContext'
import {usePathname} from 'expo-router'

/**
 * BottomAccessory live crawl: Home tab upcoming matches screen only
 * (canonical or mini-league home). Hidden on Match scoresheet and other routes.
 */
export function useShowLiveScoresAccessory(): boolean {
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
