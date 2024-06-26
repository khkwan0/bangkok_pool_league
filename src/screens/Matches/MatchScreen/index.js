import React from 'react'
import {AppState, FlatList, Platform} from 'react-native'
import {
  ActivityIndicator,
  Button,
  Dialog,
  Paragraph,
  Portal,
  RadioButton,
} from 'react-native-paper'
import {Divider, Pressable, Row, Text, View} from '@ybase'
import Frame from '../components/Frame'
import CompletedFrame from '../components/CompletedFrame'
import TeamsHeadline from '../components/TeamsHeadline'
import {useFocusEffect} from '@react-navigation/native'
import {useAppSelector} from '~/lib/hooks/redux'
import {useMatch, useTeams, useSeason, useNetwork} from '~/lib/hooks'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useYBase} from '~/lib/hooks'

// import {socket} from '~/socket'
import {io} from 'socket.io-client'
import {useTranslation} from 'react-i18next'
import config from '~/config'

const MatchScreen = props => {
  const insets = useSafeAreaInsets()
  const {t} = useTranslation()
  const [matchInfo] = React.useState(props.route.params.matchInfo)
  const user = useAppSelector(_state => _state.userData).user

  const team = useTeams()
  const season = useSeason()
  const network = useNetwork()
  const match = useMatch()
  const [socket, setSocket] = React.useState(null)
  const [gameTypes, setGameTypes] = React.useState({})
  const [teams, setTeams] = React.useState({})
  const [firstBreak, setFirstBreak] = React.useState(0)
  const [frames, setFrames] = React.useState([])
  const [isMounted, setIsMounted] = React.useState(false)
  const [homeScore, setHomeScore] = React.useState(0)
  const [awayScore, setAwayScore] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [finalizedHome, setFinalizedHome] = React.useState(false)
  const [finalizedAway, setFinalizedAway] = React.useState(false)
  const [finalizedAwayLoading, setFinalizedAwayLoading] = React.useState(false)
  const [finalizedHomeLoading, setFinalizedHomeLoading] = React.useState(false)
  const [showDialogFirstBreak, setShowDialogFirstBreak] = React.useState({
    show: false,
    cb: null,
  })
  const [showDialogWin, setShowDialogWin] = React.useState({
    show: false,
    cb: null,
  })
  const [error, setError] = React.useState('')
  const appState = React.useRef(AppState.currentState)
  const {colors} = useYBase()

  /*
  useFocusEffect(
    React.useCallback(() => {
      return () => setIsMounted(false)
    }, []),
  )
  */

  React.useEffect(() => {
    props.navigation.setOptions({headerTitle: '#' + matchInfo.match_id})
  }, [])

  React.useEffect(() => {
    console.log('setting socket')
    setSocket(io('https://' + config.domain, {autoConnect: false}))
    return () => {
      if (socket) {
        console.log('disconnecting socket')
        socket.disconnect()
      }
    }
  }, [])

  React.useEffect(() => {
    if (socket) {
      ;(async () => {
        try {
          setIsLoading(true)
          console.log('getting game types')
          const _gameTypes = await season.GetGameTypes()
          setGameTypes(_gameTypes)

          console.log('rendering init frames')
          await RenderInitialFrames()

          console.log('update teams')
          await UpdateTeams()

          console.log('Get frames')
          await GetFrames()

          console.log('updatematch info')
          await UpdateMatchInfo()

          setIsLoading(false)
          setIsMounted(true)
        } catch (e) {
          setError('Something is very wrong')
          console.log(e)
        }
      })()
      return () => {
        console.log('unmounting')
        //      socket.disconnect()
        setIsMounted(false)
      }
    }
  }, [socket])

  async function HandleAppStateChange(nextAppState) {
    console.log('nextappstate', appState.current, nextAppState)
    if (Platform.OS === 'android') {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        try {
          console.log('socket', socket)
          setIsLoading(true)
          console.log('update teams')
          await UpdateTeams()

          console.log('Get frames')
          await GetFrames()

          console.log('updatematch info')
          await UpdateMatchInfo()

          setIsLoading(false)
          setIsMounted(true)
        } catch (e) {
          console.log('Appstate change error', e)
        }
      } else {
        if (socket) {
          console.log('disconnecting')
          socket.disconnect()
          socket.close()
        }
      }
    }
    if (Platform.OS === 'ios') {
      if (
        (appState.current === 'background' ||
          appState.current === 'inactive') &&
        nextAppState === 'active'
      ) {
        try {
          setIsLoading(true)
          console.log('update teams')
          await UpdateTeams()

          console.log('Get frames')
          await GetFrames()

          console.log('updatematch info')
          await UpdateMatchInfo()

          setIsLoading(false)
          setIsMounted(true)
        } catch (e) {
          console.log('Appstate change error', e)
        }
      } else {
        if (socket && appState.current === 'inactive') {
          console.log('disconnecting')
          socket.disconnect()
          socket.close()
        }
      }
    }
    appState.current = nextAppState
  }

  React.useEffect(() => {
    if (socket) {
      const subscription = AppState.addEventListener(
        'change',
        HandleAppStateChange,
        //      (nextAppState) => HandleAppStateChange(nextAppState, socket),
      )
      return () => {
        console.log('removing subscription')
        if (socket) {
          socket.disconnect()
          socket.close()
        }
        subscription.remove()
      }
    }
  }, [socket])

  const framesRef = React.useRef([])
  const setFramesRef = React.useRef(setFrames)

  React.useEffect(() => {
    framesRef.current = frames
    setFinalizedAway(false)
    setFinalizedHome(false)
  }, [frames])

  React.useEffect(() => {
    if (socket) {
      console.log('registering sockets')
      function UpdateFrameWin(frameIdx, winnerTeamId) {
        try {
          const _frames = framesRef.current
          _frames[frameIdx].winner = winnerTeamId
          UpdateScore(_frames)
        } catch (e) {
          console.log(e)
        }
      }

      function UpdateFramePlayers(frameIdx, side, playerIdx, playerId) {
        try {
          const _frames = framesRef.current
          if (side === 'home') {
            _frames[frameIdx].homePlayerIds[playerIdx] = playerId
          } else {
            _frames[frameIdx].awayPlayerIds[playerIdx] = playerId
          }
          setFrames([..._frames])
        } catch (e) {
          console.log(e)
        }
      }
      const roomId = 'match_' + matchInfo.match_id
      socket.on('reconnect', () => {
        console.log('reconnect')
      })
      socket.on('connect', () => {
        console.log('socket connected')
        socket.emit('join', roomId, joinStatus => {
          if (joinStatus.status === 'ok') {
            console.log('joined OK:' + roomId)
          }
        })
      })

      socket.on('disconnect', () => {
        console.log('socket disconnected')
      })

      socket.on('match_update', data => {
        try {
          if (typeof data !== 'undefined' && data) {
            if (typeof data.type !== 'undefined' && data.type) {
              if (data.type === 'firstbreak') {
                setFirstBreak(data.data.firstBreak)
              }
              if (data.type === 'newnote') {
                if (typeof matchInfo.meta === 'undefined') {
                  matchInfo.meta = {
                    notes: [],
                    history: [],
                  }
                }
                if (typeof matchInfo.meta.notes === 'undefined') {
                  matchInfo.meta.notes = []
                }
                matchInfo.meta.notes.push(data)
              }
              if (data.type === 'finalize') {
                if (
                  typeof data.data !== 'undefined' &&
                  typeof data.data.side !== 'undefined'
                ) {
                  if (data.data.side === 'home') {
                    setFinalizedHomeLoading(false)
                    setFinalizedHome(true)
                  }
                  if (data.data.side === 'away') {
                    setFinalizedAwayLoading(false)
                    setFinalizedAway(true)
                  }
                }
              }
              if (data.type === 'unfinalize') {
                if (
                  typeof data.data !== 'undefined' &&
                  typeof data.data.side !== 'undefined'
                ) {
                  if (data.data.side === 'home') {
                    setFinalizedHomeLoading(false)
                    setFinalizedHome(false)
                  }
                  if (data.data.side === 'away') {
                    setFinalizedAwayLoading(false)
                    setFinalizedAway(false)
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log(e)
        }
      })

      socket.on('frame_update', data => {
        if (typeof data.type !== 'undefined') {
          if (data.type === 'win') {
            UpdateFrameWin(data.frameIdx, data.winnerTeamId)
          } else if (data.type === 'players') {
            ;(async () => {
              if (data.newPlayer) {
                await UpdateTeams()
              }
              UpdateFramePlayers(
                data.frameIdx,
                data.side,
                data.playerIdx,
                data.playerId,
              )
            })()
          }
        }
      })

      socket.on('historyupdate', data => {
        if (typeof matchInfo.meta === 'undefined') {
          matchInfo.meta = {
            notes: [],
            history: [],
          }
        }
        if (typeof matchInfo.meta.history === 'undefined') {
          matchInfo.meta.history = []
        }
        matchInfo.meta.history.push(data)
      })

      return () => {
        socket.close()
      }
    }
  }, [socket])

  /*
   * When returning from the Roster (the screen where a captain assign's a
   * player for a slot), that is when the playerId is passed back.  Normally
   * I would've passed a function handler in the props to the Roster screen,
   * however you cannot pass non serializable values (like a function) through
   * the react navigation navigator via props.route.params.
   * However, react native navigation allows you to pass non serialized values
   * BACK to the previous screen in the stack when you goBack() or
   * when you props.navigation.navigate('previous screen')
   */
  React.useEffect(() => {
    // keep players in an array in frameInfo
    // doubles games will have 1 playerIds in the array
    // playerIdx is either element -1 or element 1 (if doubles)
    if (props.route.params.player) {
      const player = props.route.params.player
      const frameInfo = player.frameInfo
      const playerId = player.playerId
      const _frames = [...frames]
      const newPlayer = player.newPlayer
      const newToTeam = player.newToTeam
      ;(async () => {
        let side = 'home'
        if (frameInfo.teamId === matchInfo.away_team_id) {
          side = 'away'
          _frames[frameInfo.frameIdx].awayPlayerIds[frameInfo.playerIdx] =
            playerId
        } else {
          _frames[frameInfo.frameIdx].homePlayerIds[frameInfo.playerIdx] =
            playerId
        }
        if (newToTeam) {
          const teamId =
            side === 'home' ? matchInfo.home_team_id : matchInfo.away_team_id
          const res = await team.AddExistingPlayerToTeam(teamId, playerId)
        }
        if (newPlayer || newToTeam) {
          UpdateTeams()
        }
        SocketSend('players', {
          frameNumber: _frames[frameInfo.frameIdx].frameNumber,
          matchId: matchInfo.match_id,
          frameIdx: frameInfo.frameIdx,
          side: side,
          playerId: playerId,
          playerIdx: frameInfo.playerIdx,
          newPlayer: newPlayer,
          frameType: _frames[frameInfo.frameIdx].type,
        })
        setFrames(_frames)
      })()
    }
  }, [props.route.params?.player])

  /*
  useFocusEffect(
    React.useCallback(() => {
      ;(async () => {
        await UpdateTeams()
        setIsMounted(true)
        setIsLoading(false)
      })()
    }, []),
  )
  */

  const userTeam = React.useMemo(() => {
    if (Object.keys(teams).length === 2) {
      if (
        teams[matchInfo.home_team_id].find(
          player => player.playerId === user?.id,
        )
      ) {
        return 'home'
      }
      if (
        teams[matchInfo.away_team_id].find(
          player => player.playerId === user?.id,
        )
      ) {
        return 'away'
      }
    }
    return null
  }, [user, teams])

  function SocketSend(type, data = {}) {
    network.SocketSend(
      type,
      matchInfo.match_id,
      data,
      '',
      user.id,
      user.nickname,
      socket,
    )
  }

  function UpdateFrames(frameData) {
    if (frameData) {
      const _frames = framesRef.current
      if (frameData.frames !== 'undefined' && Array.isArray(frameData.frames)) {
        frameData.frames.forEach(_incomingFrame => {
          let i = 0
          let found = false
          while (i < _frames.length && !found) {
            if (i === _incomingFrame.frameIdx) {
              found = true
            } else {
              i++
            }
          }
          if (found) {
            _frames[i].winner = _incomingFrame.winner
            _frames[i].homePlayerIds = _incomingFrame.homePlayerIds
            _frames[i].awayPlayerIds = _incomingFrame.awayPlayerIds
          }
        })
        UpdateScore(_frames)
        setFrames([..._frames])
      }
    }
  }

  async function GetFrames() {
    try {
      const matchId = matchInfo.match_id
      const res = await match.GetFrames(matchId)
      if (
        typeof res.status !== 'undefined' &&
        res.status &&
        res.status === 'ok'
      ) {
        UpdateFrames(res.data)
      }
    } catch (e) {
      console.log('get frames', e)
    }
  }

  async function UpdateMatchInfo() {
    try {
      const matchId = matchInfo.match_id
      const res = await match.GetMatchInfo(matchId)
      if (
        typeof res.status !== 'undefined' &&
        res.status &&
        res.status === 'ok'
      ) {
        const _matchInfo = res.data
        if (
          typeof _matchInfo?.firstBreak !== 'undefined' &&
          _matchInfo.firstBreak
        ) {
          setFirstBreak(_matchInfo.firstBreak)
        }
        let _finalizedHome = false
        let _finalizeAway = false
        if (
          typeof _matchInfo?.finalize_home !== 'undefined' &&
          _matchInfo.finalize_home.teamId
        ) {
          _finalizedHome = true
        }
        if (
          typeof _matchInfo?.finalize_away !== 'undefined' &&
          _matchInfo.finalize_away.teamId
        ) {
          _finalizeAway = true
        }
        setFinalizedAway(_finalizeAway)
        setFinalizedHome(_finalizedHome)
        if ((!_finalizeAway || !_finalizedHome) && !socket.connected) {
          console.log('socket connecting')
          socket.connect()
        }
        matchInfo.meta = {..._matchInfo}
      }
    } catch (e) {
      console.log(e)
    }
  }

  function RenderInitialFrames() {
    return new Promise((resolve, reject) => {
      try {
        const _format = JSON.parse(matchInfo.format)
        const sections = _format[0].subsections
        const _frames = []
        let frame_number = 1
        let section_count = 1
        sections.forEach(section => {
          for (let i = 0; i < section.frames; i++) {
            _frames.push({
              section: section_count,
              mfpp: section.mfpp,
              frameNumber: frame_number,
              type: section.type,
              winner: 0,
              homePlayerIds: [],
              awayPlayerIds: [],
            })
            frame_number++
          }
          _frames.push({
            frameNumber: -1,
            type: 'section',
            section: section_count,
            homeScore: 0,
            awayScore: 0,
          })
          section_count++
        })
        setFrames(_frames)
        resolve()
      } catch (e) {
        console.log('reject')
        reject(e)
      }
    })
  }

  function ChoosePlayer(teamId, playerIdx, frameIdx, section, mfpp) {
    props.navigation.navigate('Roster', {
      teams: teams,
      frameInfo: {playerIdx, frameIdx, teamId},
      section: section,
      mfpp: mfpp,
      frames: frames,
      fromCompleted: props?.route?.params?.fromCompleted ?? false,
    })
  }

  function UpdateScore(_frames) {
    let _awayScore = 0
    let _homeScore = 0
    const __frames = _frames.map(frame => {
      if (frame.winner === matchInfo.home_team_id) {
        _homeScore++
      }
      if (frame.winner === matchInfo.away_team_id) {
        _awayScore++
      }
      if (frame.type === 'section') {
        frame.homeScore = _homeScore
        frame.awayScore = _awayScore
      }
      return frame
    })
    setFrames(__frames)
    setAwayScore(_awayScore)
    setHomeScore(_homeScore)
  }

  function HandleSetWinner(
    side,
    teamId,
    playerIds,
    frameIdx,
    frameType,
    frameNumber,
  ) {
    if (frames[frameIdx].winner !== 0) {
      setShowDialogWin({
        show: true,
        cb: () =>
          SetWinner(side, teamId, playerIds, frameIdx, frameType, frameNumber),
      })
    } else {
      SetWinner(side, teamId, playerIds, frameIdx, frameType, frameNumber)
    }
  }
  function SetWinner(
    side,
    teamId,
    playerIds,
    frameIdx,
    frameType,
    frameNumber,
  ) {
    const _frames = [...frames]
    _frames[frameIdx].winner = teamId
    SocketSend('win', {
      side: side,
      frameNumber: frameNumber,
      frameType: frameType,
      winnerTeamId: teamId,
      playerIds: playerIds,
      frameIdx: frameIdx,
      matchId: matchInfo.match_id,
    })
    _frames[frameIdx].timeStamp > 0
      ? (_frames[frameIdx].lastUpdate = Date.now())
      : (_frames[frameIdx].timeStamp = Date.now())
    setShowDialogWin({show: false, cb: null})
    UpdateScore(_frames)
  }

  function HandleGoBack() {
    socket.off()
    socket.disconnect()
    socket.close()
    props.navigation.goBack()
  }

  function DoSetFirstBreak(teamId) {
    setFirstBreak(teamId)
    SocketSend('firstbreak', {
      firstBreak: teamId,
    })
    setShowDialogFirstBreak({show: false, cb: null})
  }

  function HandleSetFirstBreak(teamId) {
    if (firstBreak !== 0) {
      setShowDialogFirstBreak({show: true, cb: () => DoSetFirstBreak(teamId)})
    } else {
      DoSetFirstBreak(teamId)
    }
  }

  function HandleUnFinalized(side) {
    if (
      (side === 'home' && side === userTeam) ||
      (side === 'home' && user.role_id === 9)
    ) {
      setFinalizedHomeLoading(true)
      SocketSend('unfinalize', {
        teamId: matchInfo.home_team_id,
        side: side,
        matchId: matchInfo.match_id,
      })
    } else if (
      (side === 'away' && side === userTeam) ||
      (side === 'away' && user.role_id === 9)
    ) {
      setFinalizedAwayLoading(true)
      SocketSend('unfinalize', {
        teamId: matchInfo.away_team_id,
        side: side,
        matchId: matchInfo.match_id,
      })
    }
  }

  function HandleFinalized(side) {
    if (
      (side === 'home' && side === userTeam) ||
      (side === 'home' && user.role_id === 9)
    ) {
      setFinalizedHomeLoading(true)
      SocketSend('finalize', {
        teamId: matchInfo.home_team_id,
        side: side,
        matchId: matchInfo.match_id,
      })
    } else if (
      (side === 'away' && side === userTeam) ||
      (side === 'away' && user.role_id === 9)
    ) {
      setFinalizedAwayLoading(true)
      SocketSend('finalize', {
        teamId: matchInfo.away_team_id,
        side: side,
        matchId: matchInfo.match_id,
      })
    }
  }

  async function UpdateTeams() {
    try {
      const _teams = {}
      if (typeof matchInfo.home_team_id !== 'undefined') {
        const homePlayers = await team.GetPlayers(matchInfo.home_team_id, true)
        _teams[matchInfo.home_team_id] = homePlayers.data
      }
      if (typeof matchInfo.away_team_id !== 'undefined') {
        const awayPlayers = await team.GetPlayers(matchInfo.away_team_id, true)
        _teams[matchInfo.away_team_id] = awayPlayers.data
      }
      setTeams(_teams)
    } catch (e) {
      setError('server_error_update_teams')
      console.log(e)
    }
  }
  React.useEffect(() => {
    if (finalizedAway && finalizedHome) {
      if (
        typeof props?.route?.params?.fromCompleted !== 'undefined' &&
        props.route.params.fromCompleted
      ) {
        props.navigation.navigate('Upcoming Matches', {refresh: true})
      }
    }
  }, [finalizedHome, finalizedAway])

  if (isMounted) {
    return (
      <>
        <Portal>
          <Dialog
            visible={showDialogFirstBreak.show}
            onDismiss={() => setShowDialogFirstBreak({show: false, cb: null})}>
            <Dialog.Title>Change First Break</Dialog.Title>
            <Dialog.Content>
              <Paragraph>This has already been set. Are you sure?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                mode="contained"
                onPress={() => showDialogFirstBreak.cb()}>
                Confirm
              </Button>
              <Button
                onPress={() =>
                  setShowDialogFirstBreak({show: false, cb: null})
                }>
                Cancel
              </Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog
            visible={showDialogWin.show}
            onDismiss={() => setShowDialogWin({show: false, cb: null})}>
            <Dialog.Title>Change Winner</Dialog.Title>
            <Dialog.Content>
              <Paragraph>This has already been set. Are you sure?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button mode="contained" onPress={() => showDialogWin.cb()}>
                Confirm
              </Button>
              <Button onPress={() => setShowDialogWin({show: false, cb: null})}>
                Cancel
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <View bgColor={colors.background}>
          {finalizedAway && finalizedHome && (
            <FlatList
              ListHeaderComponent={
                <View bgColor={colors.background}>
                  <TeamsHeadline matchInfo={matchInfo} isLoading={isLoading} />
                </View>
              }
              data={frames}
              renderItem={({item, index}) => (
                <CompletedFrame
                  frame={item}
                  side={userTeam}
                  firstBreak={firstBreak}
                  isLoading={isLoading}
                  matchInfo={matchInfo}
                  teams={teams}
                  gameTypes={gameTypes}
                  frameIdx={index}
                />
              )}
            />
          )}
          {(!finalizedAway || !finalizedHome) && (
            <FlatList
              ListHeaderComponent={
                <View bgColor={colors.background}>
                  {isLoading && (
                    <View style={{flex: 1, justifyContent: 'center'}}>
                      <ActivityIndicator />
                    </View>
                  )}
                  <Row alignItems="center" mt={20}>
                    <View flex={2} justifyContent="center" alignItems="center">
                      <Pressable
                        onPress={() =>
                          props.navigation.navigate('Team', {
                            teamId: matchInfo.home_team_id,
                          })
                        }>
                        <Text textAlign="center" bold fontSize="xxl">
                          {matchInfo.home_team_short_name
                            ? matchInfo.home_team_short_name
                            : matchInfo.home_team_name}
                        </Text>
                      </Pressable>
                    </View>
                    <View flex={1} alignItems="center">
                      <Text>vs</Text>
                    </View>
                    <View flex={2} alignItems="center">
                      <Pressable
                        onPress={() =>
                          props.navigation.navigate('Team', {
                            teamId: matchInfo.away_team_id,
                          })
                        }>
                        <Text textAlign="center" bold fontSize="xxl">
                          {matchInfo.away_team_short_name
                            ? matchInfo.away_team_short_name
                            : matchInfo.away_team_name}
                        </Text>
                      </Pressable>
                    </View>
                  </Row>
                  <RadioButton.Group
                    onValueChange={newValue => HandleSetFirstBreak(newValue)}
                    value={firstBreak}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <RadioButton.Android
                          disabled={
                            isLoading || (finalizedAway && finalizedHome)
                          }
                          value={matchInfo.home_team_id}
                        />
                        <Text>first_break</Text>
                      </View>
                      <Row flex={1} alignItems="center" justifyContent="center">
                        <RadioButton.Android
                          disabled={
                            isLoading || (finalizedAway && finalizedHome)
                          }
                          value={matchInfo.away_team_id}
                        />
                        <Text>first_break</Text>
                      </Row>
                    </View>
                  </RadioButton.Group>
                  <Row>
                    <View flex={1} justifyContent="center" alignItems="center">
                      <Text fontSize={30}>{homeScore}</Text>
                    </View>
                    <View flex={1} justifyContent="center" alignItems="center">
                      <Text fontSize={30}>{awayScore}</Text>
                    </View>
                  </Row>
                </View>
              }
              ListFooterComponent={
                <View style={{paddingVertical: 20}}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                      {finalizedHome && (
                        <Button
                          loading={finalizedHomeLoading}
                          disabled={
                            (finalizedHome && finalizedAway) || isLoading
                          }
                          onPress={() => HandleUnFinalized('home')}
                          mode="elevated">
                          Unfinalize Home
                        </Button>
                      )}
                      {!finalizedHome && (
                        <Button
                          loading={finalizedHomeLoading}
                          disabled={isLoading}
                          onPress={() => HandleFinalized('home')}
                          mode="elevated">
                          {t('finalize')} {t('home')}
                        </Button>
                      )}
                    </View>
                    <View style={{flex: 1}}>
                      {finalizedAway && (
                        <Button
                          loading={finalizedAwayLoading}
                          disabled={
                            (finalizedAway && finalizedHome) || isLoading
                          }
                          onPress={() => HandleUnFinalized('away')}
                          mode="elevated">
                          Unfinalize Away
                        </Button>
                      )}
                      {!finalizedAway && (
                        <Button
                          loading={finalizedAwayLoading}
                          disabled={isLoading}
                          onPress={() => HandleFinalized('away')}
                          mode="elevated">
                          {t('finalize')} {t('away')}
                        </Button>
                      )}
                    </View>
                  </View>
                  <View style={{marginTop: 10}}>
                    <Button
                      disabled={isLoading}
                      icon="dots-triangle"
                      mode="contained"
                      onPress={() =>
                        props.navigation.navigate('Match Info', {matchInfo})
                      }>
                      {t('more')}
                    </Button>
                  </View>
                </View>
              }
              data={frames}
              ItemSeparatorComponent={
                <View style={{marginVertical: 5}}>
                  <Divider bold />
                </View>
              }
              stickyHeaderIndices={[0]}
              renderItem={({item, index}) => (
                <Frame
                  side={userTeam}
                  firstBreak={firstBreak}
                  isLoading={isLoading}
                  matchInfo={matchInfo}
                  teams={teams}
                  gameTypes={gameTypes}
                  frameIdx={index}
                  framesLength={frames.length}
                  frame={item}
                  choosePlayer={ChoosePlayer}
                  setWinner={HandleSetWinner}
                  finalizedAway={finalizedAway}
                  finalizedHome={finalizedHome}
                />
              )}
            />
          )}
        </View>
      </>
    )
  } else {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    )
  }
}

export default MatchScreen
