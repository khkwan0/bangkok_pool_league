import React, {createContext, useContext, useReducer} from 'react'
import {useMatch, useTeams} from '@/hooks'
import {io} from 'socket.io-client'
import config from '@/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useLeagueContext} from './LeagueContext'
import StatsHeader from '@/components/PlayerStatistics/StatsHeader'
import {FrameType, MatchInfoDataType} from '@/components/Match/types'

type JoinStatusType = {
  status: string
}

type StatsType = {
  [key: string]: {
    [key: string]: {
      win: boolean
      type: string
    }
  }
}

type TeamsType = {
  [key: string]: {
    [key: string]: {
      id: number
      nickname: string
      playerId: number
    }
  }
}

type StateType = {
  firstBreak: number | null
  frameData: FrameType[]
  teams: TeamsType
  matchInfo: MatchInfoDataType
  stats: StatsType
  history: any[]
  finalizedHome: boolean
  finalizedAway: boolean
}

const MatchContext = createContext({})

const initialState: StateType = {
  firstBreak: null,
  frameData: [],
  teams: {},
  matchInfo: {} as MatchInfoDataType,
  stats: {},
  history: [],
  finalizedHome: false,
  finalizedAway: false,
}

const MatchReducer = (state: StateType, action: any) => {
  switch (action.type) {
    case 'CLEAR_MATCHSTATE': {
      return {
        firstBreak: null,
        frameData: [],
        teams: {},
        matchInfo: {} as MatchInfoDataType,
        stats: {},
        finalizedHome: false,
        finalizedAway: false,
      }
    }
    case 'SET_MATCHINFO': {
      return {
        ...state,
        matchInfo: action.payload,
      }
    }
    case 'SET_TEAMS': {
      return {
        ...state,
        teams: action.payload,
      }
    }
    case 'SET_PLAYER': {
      // race condition here
      // this is a get and set operation
      // can be called at the same time by incoming websocket data or
      // by user input
      const {frameIndex, playerId, side, slot} = action.payload
      const frame = {...state.frameData[frameIndex]}
      if (side === 'home') {
        frame.homePlayerIds[slot] = playerId
      } else {
        frame.awayPlayerIds[slot] = playerId
      }
      const _frameData = [...state.frameData]
      _frameData[frameIndex] = frame
      return {
        ...state,
        frameData: _frameData,
      }
    }
    case 'SET_WINNER': {
      const {frameIndex, winnerTeamId, goldenBreak} = action.payload
      const frame = {...state.frameData[frameIndex]}
      frame.winner = winnerTeamId
      frame.goldenBreak = goldenBreak
      const _frameData = [...state.frameData]
      _frameData[frameIndex] = frame
      return {
        ...state,
        frameData: _frameData,
      }
    }
    case 'CLEAR_WINNER': {
      const {frameIdx} = action.payload
      const frame = {...state.frameData[frameIdx]}
      frame.winner = 0
      const _frameData = [...state.frameData]
      _frameData[frameIdx] = frame
      return {
        ...state,
        frameData: _frameData,
      }
    }
    case 'SET_FIRSTBREAK': {
      return {
        ...state,
        firstBreak: action.payload,
      }
    }
    case 'SET_FRAMES': {
      return {
        ...state,
        frameData: action.payload,
      }
    }
    case 'SET_STATS': {
      return {
        ...state,
        stats: action.payload,
      }
    }
    case 'SET_HISTORY': {
      return {
        ...state,
        history: action.payload,
      }
    }
    case 'SET_FINALIZED_HOME': {
      return {
        ...state,
        finalizedHome: action.payload,
      }
    }
    case 'SET_FINALIZED_AWAY': {
      return {
        ...state,
        finalizedAway: action.payload,
      }
    }
    default:
      return state
  }
}

export const MatchProvider = (props: any) => {
  const [state, dispatch] = useReducer(MatchReducer, initialState)
  const {state: leagueState}: any = useLeagueContext()
  const matchHooks = useMatch()
  const teams = useTeams()
  const roomId = React.useRef('')
  const socket = React.useRef(
    io('https://' + config.domain, {autoConnect: false}),
  )

  const matchInfoRef = React.useRef({})

  React.useEffect(() => {
    matchInfoRef.current = state.matchInfo
    UpdateTeams()
  }, [state.matchInfo])

  React.useEffect(() => {
    if (
      typeof state.matchInfo !== 'undefined' &&
      state.matchInfo &&
      typeof state.frameData !== 'undefined' &&
      Object.keys(state.frameData).length > 0
    ) {
      const stats: StatsType = {}
      state.frameData.forEach((frame: FrameType, index: number) => {
        if (typeof frame.winner !== 'undefined' && frame.winner) {
          if (frame.winner === state.matchInfo.home_team_id) {
            frame.homePlayerIds.forEach((playerId: number) => {
              const key = `p${playerId}`
              if (typeof stats[key] === 'undefined') {
                stats[key] = {}
              }
              stats[key][`frame${index}`] = {
                win: true,
                type: state.matchInfo.initialFrames[index].type,
              }
            })
            frame.awayPlayerIds.forEach((playerId: number) => {
              const key = `p${playerId}`
              if (typeof stats[key] === 'undefined') {
                stats[key] = {}
              }
              stats[key][`frame${index}`] = {
                win: false,
                type: state.matchInfo.initialFrames[index].type,
              }
            })
          } else {
            frame.homePlayerIds.forEach((playerId: number) => {
              const key = `p${playerId}`
              if (typeof stats[key] === 'undefined') {
                stats[key] = {}
              }
              stats[key][`frame${index}`] = {
                win: false,
                type: state.matchInfo.initialFrames[index].type,
              }
            })
            frame.awayPlayerIds.forEach((playerId: number) => {
              const key = `p${playerId}`
              if (typeof stats[key] === 'undefined') {
                stats[key] = {}
              }
              stats[key][`frame${index}`] = {
                win: true,
                type: state.matchInfo.initialFrames[index].type,
              }
            })
          }
        }
      })
      dispatch({type: 'SET_STATS', payload: stats})
    }
  }, [state.frameData])

  React.useEffect(() => {
    socket.current.on('connect', () => {
      console.log('connected: ', socket.current.connected)
      JoinRoom()
    })

    socket.current.on('disconnect', () => {
      console.log('disconnect')
    })

    socket.current.on('match_update', data => {
      if (typeof data.type !== 'undefined') {
        if (data.type === 'firstbreak') {
          dispatch({
            type: 'SET_FIRSTBREAK',
            payload: data.data.firstBreak,
          })
        } else if (data.type === 'finalize') {
          if (
            typeof data?.data?.side !== 'undefined' &&
            data.data.side === 'home'
          ) {
            dispatch({type: 'SET_FINALIZED_HOME', payload: true})
          } else if (
            typeof data?.data?.side !== 'undefined' &&
            data.data.side === 'away'
          ) {
            dispatch({type: 'SET_FINALIZED_AWAY', payload: true})
          }
        } else if (data.type === 'unfinalize') {
          if (
            typeof data?.data?.side !== 'undefined' &&
            data.data.side === 'home'
          ) {
            dispatch({type: 'SET_FINALIZED_HOME', payload: false})
          } else if (
            typeof data?.data?.side !== 'undefined' &&
            data.data.side === 'away'
          ) {
            dispatch({type: 'SET_FINALIZED_AWAY', payload: false})
          }
        }
      }
    })
    socket.current.on('frame_update', data => {
      if (typeof data.type !== 'undefined') {
        if (data.type === 'win') {
          dispatch({
            type: 'SET_WINNER',
            payload: {
              frameIndex: data.frameIdx,
              winnerTeamId: data.winnerTeamId,
              goldenBreak: data?.goldenBreak ?? false,
            },
          })
        } else if (data.type === 'players') {
          ;(async () => {
            if (typeof data.newPlayer !== 'undefined' && data.newPlayer) {
              UpdateTeams()
            }
            dispatch({
              type: 'SET_PLAYER',
              payload: {
                frameIndex: data.frameIdx,
                playerId: data.playerId,
                nickname: data.nickname,
                slot: data.playerIdx,
                side: data.side,
              },
            })
          })()
        } else if (data.type === 'clearwin') {
          console.log('clearwin', data)
          dispatch({
            type: 'CLEAR_WINNER',
            payload: {
              frameIdx: data.frameIdx,
            },
          })
        }
      }
    })
    socket.current.on('historyupdate2', data => {
      dispatch({type: 'SET_HISTORY', payload: data})
    })
  }, [])

  function UpdateFramePlayers(
    frameIdx: number,
    side: string,
    slot: number,
    playerId: number,
    nickname: string,
    newPlayer = false,
    frameType = '9d',
    frameNumber: number,
  ) {
    /*
    dispatch({
      type: 'SET_PLAYER',
      payload: {
        frameIndex: frameIdx,
        playerId: playerId,
        slot: slot,
        side: side,
      },
    })
      */

    const data = {
      frameNumber: frameNumber,
      frameIdx: frameIdx,
      matchId: state.matchInfo.match_id,
      side: side,
      playerId: playerId,
      nickname: nickname,
      playerIdx: slot,
      newPlayer: newPlayer,
      frameType: frameType,
    }
    SocketSend('players', data)
  }

  function UpdateFirstBreak(teamId: string) {
    const data = {
      firstBreak: parseInt(teamId),
    }
    SocketSend('firstbreak', data)
  }

  function UpdateFrameWin(
    side: string,
    frameIdx: string,
    winnerTeamId: string,
    goldenBreak: boolean,
  ) {
    console.log('UpdateFrameWin', side, frameIdx, winnerTeamId, goldenBreak)
    const mfpp = state.matchInfo.initialFrames[frameIdx].mfpp
    const frame = state.frameData[frameIdx]
    const awayPlayerCount = frame.awayPlayerIds.length
    const homePlayerCount = frame.homePlayerIds.length
    const playerIds =
      side === 'home' ? frame.homePlayerIds : frame.awayPlayerIds
//    if (awayPlayerCount === mfpp && homePlayerCount === mfpp) {
      const data = {
        side: side,
        matchId: parseInt(state.matchInfo.match_id),
        frameIdx: parseInt(frameIdx),
        frameNumber: parseInt(frame.frameNumber),
        winnerTeamId: parseInt(winnerTeamId),
        playerIds: playerIds,
        goldenBreak: goldenBreak,
      }
      SocketSend('win', data)
 //   }
  }

  function ClearFrameWinner(frameIdx: number) {
    const data = {
      frameIdx: frameIdx,
      matchId: parseInt(state.matchInfo.match_id),
    }
    SocketSend('clearwin', data)
  }

  function FinalizeMatch(side: string, teamId: number) {
    const data = {
      teamId: teamId,
      side: side,
      matchId: parseInt(state.matchInfo.match_id),
    }
    SocketSend('finalize', data)
  }

  function UnfinalizeMatch(side: string, teamId: number) {
    const data = {
      teamId: teamId,
      side: side,
      matchId: parseInt(state.matchInfo.match_id),
    }
    SocketSend('unfinalize', data)
  }

  async function UpdateTeams() {
    const {home_team_id, away_team_id} =
      matchInfoRef.current as MatchInfoDataType
    try {
      if (home_team_id && away_team_id) {
        const _teams: TeamsType = {}
        const _homePlayers = await teams.GetPlayers(home_team_id, true)
        const _awayPlayers = await teams.GetPlayers(away_team_id, true)
        const homePlayers: TeamsType[string] = {}
        const awayPlayers: TeamsType[string] = {}
        _homePlayers.data.forEach(
          (player: {playerId: number; nickname: string; id: number}) => {
            homePlayers[player.playerId] = player
          },
        )
        _awayPlayers.data.forEach(
          (player: {playerId: number; nickname: string; id: number}) => {
            awayPlayers[player.playerId] = player
          },
        )
        _teams[home_team_id] = homePlayers
        _teams[away_team_id] = awayPlayers
        dispatch({type: 'SET_TEAMS', payload: _teams})
      }
    } catch (e) {
      console.log('ERR UpdateTeams', e)
    }
  }

  function SocketConnect(_room: string) {
    roomId.current = _room
    socket.current.connect()
  }

  function SocketDisconnect() {
    socket.current.disconnect()
  }

  function JoinRoom() {
    socket.current.emit('join', roomId.current, (status: JoinStatusType) => {
      console.log(status)
    })
  }

  async function SocketSend(
    type = '',
    data = {},
    dest = '',
    userId = 0,
    nickname = '',
  ) {
    const token = await AsyncStorage.getItem('jwt')
    const toSend = {
      type: type,
      matchId: parseInt(state.matchInfo.match_id),
      timestamp: Date.now(),
      playerId: leagueState.user.id ?? 0,
      jwt: token ?? 'notoken',
      nickname: leagueState.user.nickname ?? '',
      dest: dest,
      data: {...data},
    }
    if (socket.current.connected) {
      socket.current.emit('matchupdate', toSend)
    }
  }
  /*
  React.useEffect(() => {
    ;(async () => {
      try {
        const _matchInfo = await matchHooks.GetMatchInfo(
          props.matchInfo.match_id,
        )
        console.log(_matchInfo)
        if (
          typeof _matchInfo.firstBreak !== 'undefined' &&
          _matchInfo.firstBreak
        ) {
          dispatch({type: 'SET_FIRSTBREAK', payload: _matchInfo.firstBreak})
        }
      } catch (e) {
        console.log('Match provider error', e)
      }
    })()
  }, [])
  */

  return (
    <MatchContext.Provider
      value={{
        state,
        dispatch,
        ClearFrameWinner,
        FinalizeMatch,
        SocketConnect,
        SocketDisconnect,
        UnfinalizeMatch,
        UpdateFirstBreak,
        UpdateFramePlayers,
        UpdateFrameWin,
        UpdateTeams,
      }}>
      {props.children}
    </MatchContext.Provider>
  )
}

export const useMatchContext = () => useContext(MatchContext)
