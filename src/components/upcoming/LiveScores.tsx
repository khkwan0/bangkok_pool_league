import LiveScoresTicker from '@/components/upcoming/LiveScoresTicker'

/**
 * In-page live scores crawl for Android/web (BottomAccessory is iOS-only).
 * Mount at the top of the Home upcoming-matches screen.
 */
export default function LiveScores() {
  return <LiveScoresTicker variant="default" />
}
