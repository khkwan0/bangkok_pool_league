import Row from '@/components/Row'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeague} from '@/hooks'
import {useTheme} from '@react-navigation/native'
import React from 'react'
import {AppState, Pressable, StyleSheet} from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

type LiveScore = {
  id: number
  home_name: string
  away_name: string
  homeScore: number | string
  awayScore: number | string
}

const SCROLL_SPEED_PX_PER_SEC = 40
const REFRESH_INTERVAL_MS = 30000

const Score = ({
  item,
  onPress,
}: {
  item: LiveScore
  onPress: (matchId: number) => void
}) => {
  const {colors} = useTheme()

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.home_name} ${item.homeScore} vs ${item.awayScore} ${item.away_name}`}>
      <View
        className="py-4 px-4"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          marginRight: 12,
        }}>
        <Row alignItems="center" justifyContent="center">
          <Text type="subtitle" style={{textAlign: 'right'}} numberOfLines={1}>
            {item.home_name}
          </Text>
          <Text type="subtitle" style={{marginHorizontal: 8}}>
            {item.homeScore} vs {item.awayScore}
          </Text>
          <Text type="subtitle" style={{textAlign: 'left'}} numberOfLines={1}>
            {item.away_name}
          </Text>
        </Row>
      </View>
    </Pressable>
  )
}

const scoresKey = (items: LiveScore[]) =>
  items.map(s => `${s.id}:${s.homeScore}-${s.awayScore}`).join('|')

const LiveScores = (props: {handlePress: (matchId: number) => void}) => {
  const [scores, setScores] = React.useState<LiveScore[]>([])
  const league = useLeague()
  const translateX = useSharedValue(0)
  const refreshTimer = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const scoresKeyRef = React.useRef('')
  const measuredWidthRef = React.useRef(0)
  const animationStartedRef = React.useRef(false)
  const layoutDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const startScroll = React.useRef((width: number) => {
    'worklet'
    if (width <= 0) {
      return
    }
    cancelAnimation(translateX)
    translateX.value = 0
    translateX.value = withRepeat(
      withTiming(-width, {
        duration: (width / SCROLL_SPEED_PX_PER_SEC) * 1000,
        easing: Easing.linear,
      }),
      -1,
      false,
    )
  }).current

  const stopScroll = React.useRef(() => {
    'worklet'
    cancelAnimation(translateX)
  }).current

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }))

  const getLiveScores = React.useCallback(async () => {
    try {
      const res = await league.GetLiveScores()
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        const next = res.data as unknown as LiveScore[]
        const key = scoresKey(next)
        if (key !== scoresKeyRef.current) {
          scoresKeyRef.current = key
          measuredWidthRef.current = 0
          animationStartedRef.current = false
          runOnUI(stopScroll)()
          setScores(next)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, [stopScroll])

  React.useEffect(() => {
    getLiveScores()
  }, [getLiveScores])

  React.useEffect(() => {
    refreshTimer.current = setInterval(getLiveScores, REFRESH_INTERVAL_MS)
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current)
      }
    }
  }, [getLiveScores])

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') {
        runOnUI(stopScroll)()
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current)
          refreshTimer.current = null
        }
      } else {
        getLiveScores()
        if (measuredWidthRef.current > 0) {
          runOnUI(startScroll)(measuredWidthRef.current)
        }
        refreshTimer.current = setInterval(getLiveScores, REFRESH_INTERVAL_MS)
      }
    })

    return () => {
      subscription.remove()
      if (layoutDebounceRef.current) {
        clearTimeout(layoutDebounceRef.current)
      }
      runOnUI(stopScroll)()
    }
  }, [getLiveScores, startScroll, stopScroll])

  const handlePress = React.useCallback(
    (matchId: number) => {
      props.handlePress(matchId)
    },
    [props],
  )

  const handleCycleLayout = React.useCallback(
    (width: number) => {
      const w = width
      if (w <= 0) {
        return
      }

      if (layoutDebounceRef.current) {
        clearTimeout(layoutDebounceRef.current)
      }

      layoutDebounceRef.current = setTimeout(() => {
        if (
          animationStartedRef.current &&
          Math.abs(w - measuredWidthRef.current) < 2
        ) {
          return
        }
        measuredWidthRef.current = w
        animationStartedRef.current = true
        runOnUI(startScroll)(w)
      }, 200)
    },
    [startScroll],
  )

  if (scores.length === 0) {
    return null
  }

  const renderScores = (keyPrefix: string) =>
    scores.map((item, index) => (
      <Score
        key={`${keyPrefix}-${item.id}-${index}`}
        item={item}
        onPress={handlePress}
      />
    ))

  return (
    <View>
      {/* Measure intrinsic width off-screen so overflow:hidden does not clip layout */}
      <View pointerEvents="none" style={styles.measureRow} collapsable={false}>
        <View
          style={styles.scoreRow}
          onLayout={e => handleCycleLayout(e.nativeEvent.layout.width)}>
          {renderScores('measure')}
        </View>
      </View>

      <View style={styles.clip}>
        <Animated.View style={[styles.scoreRow, animatedStyle]}>
          <View style={styles.scoreRow}>{renderScores('a')}</View>
          <View style={styles.scoreRow}>{renderScores('b')}</View>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  measureRow: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    top: 0,
    zIndex: -1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
})

export default LiveScores
