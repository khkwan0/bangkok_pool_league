import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '~/config'
import {useAppDispatch, useAppSelector} from '~/lib/hooks/redux'
import {ClearUser, SetUser} from '~/redux/userSlice'
import {socket} from '~/socket'

export const useNetwork = (): any => {
  const Get = async function (endpoint: string): Promise<Object> {
    try {
      const _endpoint =
        typeof endpoint !== 'undefined' && endpoint[0] === '/'
          ? endpoint.substring(1)
          : endpoint
      const domain = config.domain ?? 'localhost'
      const token = await AsyncStorage.getItem('jwt')
      const res = await fetch('https://' + domain + '/' + _endpoint, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })
      const json = await res.json()
      return json
    } catch (e) {
      console.log(endpoint, e)
      return {}
    }
  }

  const Post = async function (
    endpoint: string,
    payload: object,
  ): Promise<Object> {
    try {
      const _endpoint =
        typeof endpoint !== 'undefined' && endpoint[0] === '/'
          ? endpoint.substring(1)
          : endpoint
      const domain = config.domain ?? 'localhost'
      const token = await AsyncStorage.getItem('jwt')
      const res = await fetch('https://' + domain + '/' + _endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })
      const json = await res.json()
      return json
    } catch (e) {
      console.log(e)
      return {}
    }
  }

  const SocketSend = (type = '', matchId = 0, data = {}, dest = '') => {
    const user = {
      id: 1933,
      nickname: 'Ken K',
    }
    const toSend = {
      type: type,
      matchId: matchId,
      timestamp: Date.now(),
      playerId: user.id ?? 0,
      nickname: user.nickname,
      dest: dest,
      data: {...data},
    }
    if (socket && socket.connected) {
      socket.emit('matchupdate', toSend)
    }
  }
  return {Get, Post, SocketSend}
}

export const useAccount = (): any => {
  const dispatch = useAppDispatch()
  const {user} = useAppSelector(_state => _state.user)
  const {Get, Post} = useNetwork()

  const LoadUser = async (): Promise<void> => {
    try {
      const user = await AsyncStorage.getItem('user')
    } catch (e) {
      console.log(e)
    }
  }

  // uses jwt
  const FetchUser = async (): Promise<void> => {
    try {
      if (
        typeof user === 'undefined' ||
        !user ||
        typeof user?.id === 'undefined' ||
        !user.id
      ) {
        const userData = await Get('/user')
        dispatch(SetUser(userData))
      }
    } catch (e) {
      console.log('no user')
    }
  }

  const UpdateUser = async (userId: number, user: object): Promise<void> => {
    try {
    } catch (e) {
      console.log(e)
    }
  }

  async function UserLogin(email: string, password: string) {
    try {
      const res = await Post('/login', {email, password}, false)
      console.log(res)
      /*
      const res = {
        email: 'khkwan0@gmail.com',
        id: 1,
        token: 'asd',
        firstName: 'Kenneth',
        lastName: 'K',
      }
  const user = useAppSelector
      */
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        if (typeof res.data !== 'undefined' && res.data) {
          await AsyncStorage.setItem('jwt', res.data.token)
          dispatch(SetUser(res.data.user))
          return {status: 'ok'}
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function Logout() {
    await AsyncStorage.removeItem('user')
    dispatch(ClearUser())
    await Get('/logout')
    await AsyncStorage.removeItem('jwt')
  }

  return {FetchUser, LoadUser, UserLogin, Logout, UpdateUser}
}

export const useLeague = (): any => {
  const {Get, Post} = useNetwork()

  const GetSeason = async () => {
    try {
      const season = await Get('/season')
      return season.season
    } catch (e) {
      console.log('no season')
    }
  }

  const GetPlayerInfo = async (playerId = 0) => {
    try {
      const playerInfo = await Get('/player/' + playerId)
      return playerInfo
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  }

  const GetPlayerStats = async (seasonId = null) => {
    try {
      const stats = await Get('/stats/players/' + seasonId)
      return stats
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const GetPlayerStatsInfo = async (playerId = 0) => {
    try {
      const playerInfo = await Get('/player/stats/info/' + playerId)
      return playerInfo
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const GetPlayers = async (activeOnly = false) => {
    try {
      const res = await Get('/players?active_only=' + activeOnly)
      return res
    } catch (e) {
      return []
    }
  }

  const GetStandings = async (seasonId = null) => {
    try {
      if (seasonId) {
        const res = await Get('/league/standings/')
        return res
      } else {
        const res = await Get('/league/standings/' + seasonId)
        return res
      }
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const SaveNewPlayer = async (
    nickName = '',
    firstName = '',
    lastName = '',
    email = '',
    teamId = 0,
  ) => {
    try {
      const res = Post('/player', {
        nickName,
        firstName,
        lastName,
        email,
        teamId,
      })
      return res
    } catch (e) {
      console.log(e)
      return {status: 'err', msg: 'Save error'}
    }
  }

  const GetVenues = async () => {
    try {
      const res = await Get('/venues')
      return res
    } catch (e) {
      return []
    }
  }

  const GetTeamStats = async (seasonId = null) => {
    try {
      const res = await Get('/stats/teams/' + seasonId)
      return res
    } catch (e) {
      return []
    }
  }

  const GetTeams = async () => {
    try {
      const res = await Get('/teams')
      return res
    } catch (e) {
      return []
    }
  }

  const GetTeamInfo = async (teamId: number): Promise<Object> => {
    try {
      const res = await Get('/team/' + teamId)
      return res
    } catch (e) {
      console.log(e)
      return {}
    }
  }

  return {
    GetPlayerInfo,
    GetPlayerStats,
    GetPlayerStatsInfo,
    GetPlayers,
    GetSeason,
    GetStandings,
    GetTeams,
    GetTeamInfo,
    GetTeamStats,
    GetVenues,
    SaveNewPlayer,
  }
}

export const useSeason = (): any => {
  const {Get} = useNetwork()

  const GetDoublesStats = async (playerId: number): Promise<Object> => {
    try {
      const stats = await Get('/stats/doubles?playerid=' + playerId)
      return stats
    } catch (e) {
      console.log(e)
      return {}
    }
  }

  const GetMatchPerformance = async (playerId: number): Promise<Object> => {
    try {
      const stats = await Get('/stats/match?playerid=' + playerId)
      return stats
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const GetMatchStats = async (matchId: number): Promise<Object> => {
    try {
      const stats = await Get('/match/stats/' + matchId)
      return stats
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const GetMatches = async (options: Array<string> = []): Promise<Object> => {
    try {
      const query = options.join('&')
      const matches = await Get('/matches?' + query)
      return matches
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const GetMatchesBySeason = async (season: number): Promise<Object> => {
    try {
      const matches = await Get('/season/matches?season=' + season)
      return matches
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const GetPlayerStats = async (playerId: number): Promise<Object> => {
    try {
      const stats = await Get('/stats?playerid=' + playerId)
      return stats
    } catch (e) {
      console.log(e)
      return {}
    }
  }

  const GetTeams = async (): Promise<Object> => {
    try {
      const teams = await Get('/teams')
      return teams
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const GetGameTypes = async (): Promise<Object> => {
    try {
      const gameTypes = await Get('/game/types')
      return gameTypes
    } catch (e) {
      console.log(e)
      return []
    }
  }

  return {
    GetDoublesStats,
    GetMatchPerformance,
    GetMatchStats,
    GetMatches,
    GetMatchesBySeason,
    GetPlayerStats,
    GetTeams,
    GetGameTypes,
  }
}

export const useTeams = (): any => {
  const {Get} = useNetwork()

  const GetPlayers = async (
    teamid: number = -1,
    activeOnly = false,
  ): Promise<Object> => {
    try {
      if (teamid && Number.isInteger(teamid) && teamid >= 0) {
        const players = await Get(
          '/players?teamid=' + teamid + '&active_only=' + activeOnly,
        )
        return players
      }
    } catch (e) {
      console.log(e)
      return []
    }
  }

  return {GetPlayers}
}

export const useMatch = () => {
  const {Get} = useNetwork()

  const GetFrames = async matchId => {
    try {
      const frames = await Get('/frames/' + matchId)
      return frames
    } catch (e) {
      return []
    }
  }

  const GetMatchInfo = async matchId => {
    try {
      const res = await Get('/match/' + matchId)
      return res
    } catch (e) {
      return {}
    }
  }

  return {GetFrames, GetMatchInfo}
}

export const useTwitter = () => {
  const GetToken = async () => {
    try {
      const callback = 'https://api.bkkleague.com/auth/twitter'
      const url = 'https://api.twitter.com/oauth/request_token'
      const query = `oauth_callback=${encodeURIComponent(callback)}`
      const oauth_consumer_key = 'BGpevnzuLeoft9174HmGl3X4N'
      const consumer_secret =
        'bwhLrPe3ehYmmqbm9udELqDc4AaBMHHLmWvYut7HkXQ1qd3Ptb'
      const oauth_nonce = Date.now()
      const timestamp = Date.now()
      const parameterString = `callback=${callback}&oauth_consumer_key=${oauth_consumer_key}&oauth_nonce=${oauth_nonce}&oauth_singature_method=HMAC-SHA1&oauth_timestamp=${timestamp}&oauth_version=1.0`
      const signatureBaseString = `POST&${encodeURI(url)}&${encodeURI(
        parameterString,
      )}`
      const signingKey = `${consumer_secret}&`
      const bytes = CryptoJS.HmacSHA1(signatureBaseString, signingKey)
      console.log('bytes', bytes)
      const signature = bytes.toString('base64')
      console.log(signature)
      const authHeader = `OAuth oauth_consumer_key="${oauth_consumer_key}", oauth_nonce="${oauth_nonce}", oauth_signature="${signature}",  oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_version="1.0"`
      const res = await fetch(`${url}?${query}`, {
        method: 'POST',
        headers: {
          Authorization: `${authHeader}`,
        },
      })
      console.log(JSON.stringify(res, null, 2))
    } catch (e) {
      console.log(JSON.stringify(e, null, 2))
      console.log('twitter gettoken', e)
    }
  }
  return {GetToken}
}
