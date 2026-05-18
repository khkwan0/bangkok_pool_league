import {ThemedText as Text} from '@/components/ThemedText'
import {Marquee} from '@animatereactnative/marquee'
import {useLeague} from '@/hooks'
import {useTheme} from '@react-navigation/native'
import React from 'react'
import {AppState, Pressable, StyleSheet, View} from 'react-native'

type LiveScore = {
  id: number
  home_name: string
  away_name: string
  homeScore: number | string
  awayScore: number | string
}

const REFRESH_INTERVAL_MS = 30000
// ~40px/s at 60fps (library advances `speed` px per frame when frameRate is unset)
const MARQUEE_SPEED = 0.67

const scoresKey = (items: LiveScore[]) =>
  items.map(s => `${s.id}:${s.homeScore}-${s.awayScore}`).join('|')

type ScoreItemProps = {
  item: LiveScore
  borderColor: string
  onPress: (matchId: number) => void
}

const ScoreItem = React.memo(function ScoreItem({
  item,
  borderColor,
  onPress,
}: ScoreItemProps) {
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.home_name} ${item.homeScore} vs ${item.awayScore} ${item.away_name}`}>
      <View style={[styles.scoreCard, {borderColor}]}>
        <View style={styles.scoreRow}>
          <Text type="subtitle" style={styles.homeName} numberOfLines={1}>
            {item.home_name}
          </Text>
          <Text type="subtitle" style={styles.scoreText}>
            {item.homeScore} vs {item.awayScore}
          </Text>
          <Text type="subtitle" style={styles.awayName} numberOfLines={1}>
            {item.away_name}
          </Text>
        </View>
      </View>
    </Pressable>
  )
})

const ScoreRow = React.memo(function ScoreRow({
  scores,
  borderColor,
  onPress,
}: {
  scores: LiveScore[]
  borderColor: string
  onPress: (matchId: number) => void
}) {
  return (
    <View style={styles.row}>
      {scores.map(item => (
        <ScoreItem
          key={item.id}
          item={item}
          borderColor={borderColor}
          onPress={onPress}
        />
      ))}
    </View>
  )
})

function LiveScoresInner({handlePress}: {handlePress: (matchId: number) => void}) {
  const {colors} = useTheme()
  const league = useLeague()
  const [scores, setScores] = React.useState<LiveScore[]>([])
  const [tickerKey, setTickerKey] = React.useState(0)
  const refreshTimer = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const scoresKeyRef = React.useRef('')
  const scoresCountRef = React.useRef(0)

  const getLiveScores = React.useCallback(async () => {
    try {
      const res = await league.GetLiveScores()
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        const next = res.data as unknown as LiveScore[]
        const key = scoresKey(next)
        if (key === scoresKeyRef.current) {
          return
        }

        const isFirstLoad = scoresKeyRef.current === ''
        const countChanged = next.length !== scoresCountRef.current

        scoresKeyRef.current = key
        scoresCountRef.current = next.length

        if (isFirstLoad) {
          setScores(next)
          return
        }

        setScores(next)
        if (countChanged) {
          setTickerKey(k => k + 1)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, [league])

  const getLiveScoresRef = React.useRef(getLiveScores)
  getLiveScoresRef.current = getLiveScores

  React.useEffect(() => {
    getLiveScoresRef.current()
  }, [])

  React.useEffect(() => {
    refreshTimer.current = setInterval(
      () => getLiveScoresRef.current(),
      REFRESH_INTERVAL_MS,
    )
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current)
      }
    }
  }, [])

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current)
          refreshTimer.current = null
        }
      } else {
        getLiveScoresRef.current()
        refreshTimer.current = setInterval(
          () => getLiveScoresRef.current(),
          REFRESH_INTERVAL_MS,
        )
      }
    })
    return () => subscription.remove()
  }, [])

  const handlePressRef = React.useRef(handlePress)
  handlePressRef.current = handlePress
  const stableHandlePress = React.useCallback((matchId: number) => {
    handlePressRef.current(matchId)
  }, [])

  if (scores.length === 0) {
    return null
  }

  return (
    <View style={styles.clip}>
      <Marquee
        key={tickerKey}
        speed={MARQUEE_SPEED}
        spacing={0}
        withGesture={false}
        style={styles.marquee}>
        <ScoreRow
          scores={scores}
          borderColor={colors.border}
          onPress={stableHandlePress}
        />
      </Marquee>
    </View>
  )
}

const LiveScores = React.memo(function LiveScores(props: {
  handlePress: (matchId: number) => void
}) {
  const handlePressRef = React.useRef(props.handlePress)
  handlePressRef.current = props.handlePress
  const stableHandlePress = React.useCallback((matchId: number) => {
    handlePressRef.current(matchId)
  }, [])

  return <LiveScoresInner handlePress={stableHandlePress} />
})

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  marquee: {
    overflow: 'hidden',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  scoreCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeName: {
    textAlign: 'right',
    width: 140,
  },
  scoreText: {
    marginHorizontal: 8,
    width: 72,
    textAlign: 'center',
  },
  awayName: {
    textAlign: 'left',
    width: 140,
  },
})

export default LiveScores
