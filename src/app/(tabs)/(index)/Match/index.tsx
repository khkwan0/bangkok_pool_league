import CompletedMatchDetails from '@/components/Completed/CompletedMatchDetails'
import {
  Finalizer,
  Frame,
  More,
  ScoresheetHeader,
} from '@/components/Match/components'
import {useScoresheetTheme} from '@/components/Match/components/scoresheetTheme'
import {FrameType} from '@/components/Match/types'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMatchContext} from '@/context/MatchContext'
import {useMatch} from '@/hooks/useMatch'
import {useTabListContentContainerStyle} from '@/hooks/useTabListContentContainerStyle'
import {
  buildNoPlayersByType,
  resolveFormatSubsections,
  resolveNoPlayers,
} from '@/lib/matchFormat'
import {resolveMatchInfoFromParams} from '@/lib/matchRouteParams'
import {useLocalSearchParams, useRouter} from 'expo-router'
import {useNavigation} from 'expo-router/react-navigation'
import React from 'react'
import {AppState, FlatList, View} from 'react-native'

export type ScoreSheetProps = {
  /** When set, show this match in a parent AdaptiveSplit instead of reading the route. */
  embedMatchInfo?: Record<string, unknown>
  /** Embedded in a split detail pane: skip stack title / back navigation. */
  embedded?: boolean
}

export default function ScoreSheet({
  embedMatchInfo,
  embedded = false,
}: ScoreSheetProps = {}) {
  const router = useRouter()
  const {
    state,
    dispatch,
    SocketConnect,
    SocketDisconnect,
    UpdateTeams,
    adoptSheetGen,
  }: any = useMatchContext()
  const {RefreshUpcoming}: any = useLeagueContext()
  const match = useMatch()
  const routeParams = useLocalSearchParams()
  const [isMounted, setIsMounted] = React.useState(false)
  const [headerSticky, setHeaderSticky] = React.useState(false)
  const navigation = useNavigation()
  const theme = useScoresheetTheme()
  const listContentStyle = useTabListContentContainerStyle({paddingBottom: 16})
  // Route params can be cleared (e.g. dismissTo('/Match') after picking a
  // player) while MatchContext still holds the active scoresheet.
  const routeMatchInfo = React.useMemo(
    () =>
      resolveMatchInfoFromParams(
        routeParams as Record<string, unknown>,
        embedMatchInfo,
      ),
    [routeParams, embedMatchInfo],
  )
  const matchInfo =
    routeMatchInfo?.match_id != null
      ? routeMatchInfo
      : state?.matchInfo?.match_id != null
        ? state.matchInfo
        : routeMatchInfo
  const resolvedMatchId = (() => {
    const id = Number(matchInfo?.match_id)
    return Number.isFinite(id) && id > 0 ? id : null
  })()
  const frames = React.useRef<FrameType[]>([])
  const appState = React.useRef(AppState.currentState)
  const [refreshing, setRefreshing] = React.useState(false)

  React.useEffect(() => {
    if (embedded) return
    if (resolvedMatchId) {
      navigation.setOptions({title: '#' + resolvedMatchId})
    } else if (!state?.matchInfo?.match_id) {
      router.back()
    }
  }, [resolvedMatchId, embedded, navigation, state?.matchInfo?.match_id])

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
    let cancelled = false

    async function initScoresheet() {
      const frameTypes = await match.GetFrameTypes()
      if (cancelled) return

      const noPlayersByType = buildNoPlayersByType(frameTypes)
      const subsections = resolveFormatSubsections(matchInfo.format)
      let frameNumber = 1
      let sectionCount = 1
      const _frames: FrameType[] = []
      subsections.forEach((section, idx: number) => {
        const noPlayers = resolveNoPlayers(
          section.type,
          noPlayersByType,
          section.noPlayers,
        )
        for (let i = 0; i < section.frames; i++) {
          const _frame: FrameType = {
            frameNumber: frameNumber,
            section: sectionCount,
            mfpp: section.mfpp,
            type: section.type,
            noPlayers,
            valuePerLeg: section.valuePerLeg ?? 1,
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
            noPlayers: 0,
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
        noPlayers: 0,
        winner: 0,
        homePlayerIds: [],
        awayPlayerIds: [],
        homeScore: 0,
        awayScore: 0,
      })
      frames.current = [..._frames]
      matchInfo.initialFrames = [...frames.current]
      dispatch({type: 'SET_MATCHINFO', payload: matchInfo})
      SocketConnect('match_' + matchInfo.match_id)
      await GetFirstBreak()
      await GetFrames()
    }

    initScoresheet()

    return () => {
      cancelled = true
      SocketDisconnect()
      dispatch({type: 'CLEAR_MATCHSTATE', payload: null})
    }
  }, [])

  function blankFrames(): FrameType[] {
    const source = state?.matchInfo?.initialFrames
    if (Array.isArray(source) && source.length > 0) {
      return source.map((frame: FrameType) => ({...frame}))
    }
    return frames.current.map(frame => ({...frame}))
  }

  async function GetFrames() {
    setRefreshing(true)
    try {
      const res = await match.GetFrames(matchInfo.match_id)
      adoptSheetGen?.(res?.sheetGen)
      const __frames = blankFrames()
      if (typeof res?.data?.frames !== 'undefined') {
        const _frames = res.data.frames
        _frames.forEach((frame: FrameType) => {
          if (typeof frame.frameIndex === 'number') {
            const template = __frames[frame.frameIndex]
            __frames[frame.frameIndex] = {
              ...template,
              ...frame,
              type: frame.type ?? template?.type,
              mfpp: frame.mfpp ?? template?.mfpp,
              noPlayers: frame.noPlayers ?? template?.noPlayers,
            }
          }
        })
      }
      frames.current = __frames
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
      adoptSheetGen?.(res?.sheetGen)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        const data = res.data
        const fb = Number(data?.firstBreak)
        dispatch({
          type: 'SET_FIRSTBREAK',
          payload: Number.isFinite(fb) && fb > 0 ? fb : null,
        })
        dispatch({
          type: 'SET_FINALIZED_HOME',
          payload:
            !!data?.finalize_home &&
            Object.keys(data.finalize_home).length > 0,
        })
        dispatch({
          type: 'SET_FINALIZED_AWAY',
          payload:
            !!data?.finalize_away &&
            Object.keys(data.finalize_away).length > 0,
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  const sheetReloadSeen = React.useRef(0)
  React.useEffect(() => {
    const n = Number(state?.sheetReload ?? 0)
    if (n === sheetReloadSeen.current) return
    sheetReloadSeen.current = n
    if (n <= 0) return
    void GetFrames()
    void GetFirstBreak()
  }, [state?.sheetReload])
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
  const matchCompleted = !!(state.finalizedHome && state.finalizedAway)

  React.useEffect(() => {
    if (matchCompleted) {
      RefreshUpcoming()
    }
  }, [matchCompleted])

  if (!isMounted) {
    return null
  }

  if (matchCompleted) {
    return <CompletedMatchDetails matchId={resolvedMatchId} />
  }

  const header = (
    <ScoresheetHeader
      sticky={headerSticky}
      onToggleSticky={() => setHeaderSticky(value => !value)}
    />
  )

  return (
    <View style={{flex: 1, backgroundColor: theme.canvas}}>
      {headerSticky ? header : null}
      <FlatList
        style={{flex: 1}}
        contentContainerStyle={listContentStyle}
        refreshing={refreshing}
        onRefresh={() => GetFrames()}
        ListHeaderComponent={headerSticky ? null : header}
        ListFooterComponent={
          <>
            <Finalizer matchInfo={matchInfo} />
            <More matchId={resolvedMatchId ?? matchInfo.match_id} />
          </>
        }
        data={state.frameData}
        renderItem={({item, index}) => (
          <Frame item={item} index={index} refreshing={refreshing} />
        )}
      />
    </View>
  )
}
