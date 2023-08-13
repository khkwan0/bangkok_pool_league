import React from 'react'
import {AppState, FlatList, View} from 'react-native'
import {
  ActivityIndicator,
  Button,
  Dialog,
  Divider,
  Paragraph,
  Portal,
  RadioButton,
  Text,
} from 'react-native-paper'
import Frame from './components/Frame'
import CompletedFrame from './components/CompletedFrame'
import TeamsHeadline from './components/TeamsHeadline'
import {useFocusEffect} from '@react-navigation/native'
import {useAppSelector} from '~/lib/hooks/redux'
import {useMatch, useTeams, useSeason, useNetwork} from '~/lib/hooks'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {socket} from '~/socket'

const MatchScreen = props => {
  const insets = useSafeAreaInsets()
  const [matchInfo] = React.useState(props.route.params.matchInfo)
  //  const user = useAppSelector(_state => _state.user)
  const user = {
    id: 1933,
    nickname: 'Ken K',
  }

  const team = useTeams()
  const season = useSeason()
  const network = useNetwork()
  const match = useMatch()
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

  /*
  useFocusEffect(
    React.useCallback(() => {
      return () => setIsMounted(false)
    }, []),
  )
  */

  React.useEffect(() => {
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
      socket.disconnect()
      setIsMounted(false)
    }
  }, [])

  async function HandleAppStateChange(nextAppState) {
    console.log('nextappstate', nextAppState)
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      ;(async () => {
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
          console.log(e)
        }
      })()
    } else {
      socket.disconnect()
    }
    appState.current = nextAppState
  }

  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      HandleAppStateChange,
    )
    return () => {
      console.log('removing subscription')
      socket.disconnect()
      socket.close()
      subscription.remove()
    }
  }, [])

  const framesRef = React.useRef([])
  const setFramesRef = React.useRef(setFrames)

  React.useEffect(() => {
    framesRef.current = frames
    setFinalizedAway(false)
    setFinalizedHome(false)
  }, [frames])

  React.useEffect(() => {
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
          console.log('joined OK')
        }
      })
    })

    socket.on('disconnect', () => {
      console.log('socket disconnected')
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
      matchInfo.meta.history.push(data)
    })

    socket.on('match_update', data => {
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
            matchInfo.meta.notes.push(data)
          }
          if (data.type === 'finalize') {
            if (
              typeof data.data !== 'undefined' &&
              typeof data.data.side !== 'undefined'
            ) {
              if (data.data.side === 'home') {
                setFinalizedHome(true)
              }
              if (data.data.side === 'away') {
                setFinalizedAway(true)
              }
            }
          }
        }
      }
    })
    return () => {
      socket.close()
    }
  }, [])

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
      ;(async () => {
        if (newPlayer) {
          UpdateTeams()
        }
        let side = 'home'
        if (frameInfo.teamId === matchInfo.away_team_id) {
          side = 'away'
          _frames[frameInfo.frameIdx].awayPlayerIds[frameInfo.playerIdx] =
            playerId
        } else {
          _frames[frameInfo.frameIdx].homePlayerIds[frameInfo.playerIdx] =
            playerId
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
          player => player.playerId === user.id,
        )
      ) {
        return 'home'
      }
      if (
        teams[matchInfo.away_team_id].find(
          player => player.playerId === user.id,
        )
      ) {
        return 'away'
      }
    }
    return null
  }, [user, teams])

  function SocketSend(type, data = {}) {
    network.SocketSend(type, matchInfo.match_id, data)
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
        console.log('sc', socket.connected)
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
          SetWinner(teamId, playerIds, frameIdx, frameType, frameNumber),
      })
    } else {
      SetWinner(teamId, playerIds, frameIdx, frameType, frameNumber)
    }
  }
  function SetWinner(teamId, playerIds, frameIdx, frameType, frameNumber) {
    const _frames = [...frames]
    _frames[frameIdx].winner = teamId
    SocketSend('win', {
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

  function HandleFinalized(side) {
    //    if (side === 'home' && side === userTeam) {
    if (side === 'home') {
      setFinalizedHome(true)
      SocketSend('finalize', {
        teamId: matchInfo.home_team_id,
        side: side,
        matchId: matchInfo.match_id,
      })
    } else if (side === 'away') {
      //} && side === userTeam) {
      setFinalizedAway(true)
      SocketSend('finalize', {
        teamId: matchInfo.away_team_id,
        side: side,
        matchId: matchInfo.match_id,
      })
    }
  }

  async function UpdateTeams() {
    const _teams = {}
    if (typeof matchInfo.home_team_id !== 'undefined') {
      const homePlayers = await team.GetPlayers(matchInfo.home_team_id)
      _teams[matchInfo.home_team_id] = homePlayers
    }
    if (typeof matchInfo.away_team_id !== 'undefined') {
      const awayPlayers = await team.GetPlayers(matchInfo.away_team_id)
      _teams[matchInfo.away_team_id] = awayPlayers
    }
    setTeams(_teams)
  }

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
        <View style={{paddingBottom: insets.bottom}}>
          {finalizedAway && finalizedHome && (
            <FlatList
              ListHeaderComponent={
                <View style={{backgroundColor: '#fff'}}>
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
                <View style={{backgroundColor: '#fff'}}>
                  {isLoading && (
                    <View style={{flex: 1, justifyContent: 'center'}}>
                      <ActivityIndicator />
                    </View>
                  )}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{
                        flex: 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        variant="headlineSmall"
                        style={{textAlign: 'center'}}>
                        {matchInfo.home_team_short_name}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Text>VS</Text>
                    </View>
                    <View
                      style={{
                        flex: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        variant="headlineSmall"
                        style={{textAlign: 'center'}}>
                        {matchInfo.away_team_short_name}
                      </Text>
                    </View>
                  </View>
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
                        <Text>First Break</Text>
                      </View>
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
                          value={matchInfo.away_team_id}
                        />
                        <Text>First Break</Text>
                      </View>
                    </View>
                  </RadioButton.Group>
                  <View style={{flexDirection: 'row'}}>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text variant="displaySmall">{homeScore}</Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text variant="displaySmall">{awayScore}</Text>
                    </View>
                  </View>
                </View>
              }
              ListFooterComponent={
                <View style={{paddingBottom: 20}}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                      {finalizedHome && (
                        <Button
                          disabled={
                            (finalizedHome && finalizedAway) || isLoading
                          }
                          onPress={() => HandleFinalized('home')}
                          mode="elevated">
                          {finalizedHome && finalizedAway
                            ? 'Submitted'
                            : 'Unfinalize Home'}
                        </Button>
                      )}
                      {!finalizedHome && (
                        <Button
                          disabled={isLoading}
                          onPress={() => HandleFinalized('home')}
                          mode="elevated">
                          Finalize Home
                        </Button>
                      )}
                    </View>
                    <View style={{flex: 1}}>
                      {finalizedAway && (
                        <Button
                          disabled={
                            (finalizedAway && finalizedHome) || isLoading
                          }
                          onPress={() => HandleFinalized('away')}
                          mode="elevated">
                          {finalizedHome && finalizedAway
                            ? 'Submitted'
                            : 'Unfinalize Away'}
                        </Button>
                      )}
                      {!finalizedAway && (
                        <Button
                          disabled={isLoading}
                          onPress={() => HandleFinalized('away')}
                          mode="elevated">
                          Finalize Away
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
                      More
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
