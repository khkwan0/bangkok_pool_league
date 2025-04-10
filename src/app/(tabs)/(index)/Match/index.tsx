import {ThemedView as View} from '@/components/ThemedView'
import {FlatList, AppState} from 'react-native'
import {
  Finalizer,
  FirstBreak,
  Frame,
  More,
  Score,
  VSHeader,
} from '@/components/Match/components'
import React from 'react'
import {useMatchContext} from '@/context/MatchContext'
import {useMatch} from '@/hooks/useMatch'
import {router, useLocalSearchParams} from 'expo-router'
import Divider from '@/components/Divider'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useNavigation} from '@react-navigation/native'
import {FrameType} from '@/components/Match/types'
import CompletedMatchDetails from '@/components/Completed/CompletedMatchDetails'

export default function ScoreSheet() {
  const {state, dispatch, SocketConnect, SocketDisconnect, UpdateTeams}: any =
    useMatchContext()
  const match = useMatch()
  const {params} = useLocalSearchParams()
  const [isMounted, setIsMounted] = React.useState(false)
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const matchInfo =
    typeof params !== 'undefined' ? JSON.parse(params as string) : {}
  const frames = React.useRef<FrameType[]>([])
  const appState = React.useRef(AppState.currentState)
  const [refreshing, setRefreshing] = React.useState(false)

  React.useEffect(() => {
    if (typeof matchInfo.match_id !== 'undefined') {
      navigation.setOptions({title: '#' + matchInfo.match_id})
    } else {
      router.back()
    }
  }, [])

  React.useEffect(() => {
    // Listen for app state changes (background to foreground)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // Refresh match data when app comes back to foreground
        GetFrames()
        GetFirstBreak()
      }
      // Update app state reference
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])

  React.useEffect(() => {
    const format = JSON.parse(matchInfo.format as string)
    const subsections = format[0].subsections
    let frameNumber = 1
    let sectionCount = 1
    const _frames: FrameType[] = []
    subsections.forEach((section: any, idx: number) => {
      for (let i = 0; i < section.frames; i++) {
        const _frame: FrameType = {
          frameNumber: frameNumber,
          section: sectionCount,
          mfpp: section.mfpp,
          type: section.type,
          winner: 0,
          homePlayerIds: [],
          awayPlayerIds: [],
          homeScore: 0,
          awayScore: 0,
        }
        _frames.push(_frame)
        frameNumber++
      }
      if (idx < subsections.length - 1) {
        const _frame: FrameType = {
          frameNumber: -1,
          section: sectionCount,
          mfpp: 0,
          type: 'section',
          winner: 0,
          homePlayerIds: [],
          awayPlayerIds: [],
          homeScore: 0,
          awayScore: 0,
        }
        _frames.push(_frame)
      }
      sectionCount++
    })
    _frames.push({
      frameNumber: -1,
      section: sectionCount - 1,
      mfpp: 0,
      type: 'section',
      winner: 0,
      homePlayerIds: [],
      awayPlayerIds: [],
      homeScore: 0,
      awayScore: 0,
    })
    frames.current = [..._frames]
    return () => dispatch({type: 'CLEAR_MATCHSTATE', payload: null})
  }, [])

  React.useEffect(() => {
    matchInfo.initialFrames = [...frames.current]
    matchInfo.home_team_id = matchInfo.home_team_id
    matchInfo.away_team_id = matchInfo.away_team_id
    dispatch({type: 'SET_MATCHINFO', payload: matchInfo})
    SocketConnect('match_' + matchInfo.match_id)
    return () => SocketDisconnect()
  }, [])

  React.useEffect(() => {
    GetFirstBreak()
  }, [])

  React.useEffect(() => {
    GetFrames()
    return () => setIsMounted(false)
  }, [])

  async function GetFrames() {
    setRefreshing(true)
    const __frames = frames.current
    try {
      const res = await match.GetFrames(matchInfo.match_id)
      if (typeof res?.data?.frames !== 'undefined') {
        const _frames = res.data.frames
        _frames.forEach((frame: FrameType) => {
          if (typeof frame.frameIndex === 'number') {
            __frames[frame.frameIndex] = frame
          }
        })
      }
      dispatch({
        type: 'SET_FRAMES',
        payload: __frames,
      })

      setIsMounted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshing(false)
    }
  }

  async function GetFirstBreak() {
    try {
      const res = await match.GetMatchInfo(matchInfo.match_id)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        if (typeof res.data.firstBreak !== 'undefined' && res.data.firstBreak) {
          dispatch({type: 'SET_FIRSTBREAK', payload: res.data.firstBreak})
        }
        if (
          typeof res.data.finalize_home !== 'undefined' &&
          Object.keys(res.data.finalize_home).length > 0
        ) {
          dispatch({
            type: 'SET_FINALIZED_HOME',
            payload: true,
          })
        }
        if (
          typeof res.data.finalize_away !== 'undefined' &&
          Object.keys(res.data.finalize_away).length > 0
        ) {
          dispatch({
            type: 'SET_FINALIZED_AWAY',
            payload: true,
          })
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  /*
  React.useEffect(() => {
    ;(async () => {
      try {
        if (
          typeof state?.matchInfo?.home_team_id !== 'undefined' &&
          state?.matchInfo?.away_team_id !== 'undefined' &&
          state.matchInfo.home_team_id &&
          state.matchInfo.away_team_id
        ) {
          await UpdateTeams()
          setIsMounted(true)
        }
      } catch (e) {
        console.log(e)
      }
    })()
  }, [state.matchInfo])
  */

  // console.log(state.finalizedHome, state.finalizedAway)
  if (!isMounted) {
    return null
  } else if (state.finalizedHome && state.finalizedAway) {
    return <CompletedMatchDetails matchId={matchInfo.match_id} />
  } else {
    return (
      <FlatList
        contentContainerStyle={{paddingBottom: insets.bottom}}
        refreshing={refreshing}
        onRefresh={() => GetFrames()}
        ListHeaderComponent={
          <>
            <View className="pb-1 pt-4">
              <VSHeader matchInfo={matchInfo} />
            </View>
            <View className="py-1">
              <FirstBreak matchInfo={matchInfo} />
            </View>
            <View className="py-1">
              <Score />
            </View>
          </>
        }
        ListFooterComponent={
          <>
            <View>
              <Finalizer matchInfo={matchInfo} />
            </View>
            <View>
              <More matchId={matchInfo.match_id} />
            </View>
          </>
        }
        ItemSeparatorComponent={() => <Divider />}
        data={state.frameData}
        renderItem={({item, index}) => (
          <Frame item={item} index={index} refreshing={refreshing} />
        )}
      />
    )
  }
}
