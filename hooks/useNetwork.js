import config from '@/app/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
// import {socket} from '~/socket'

export const useNetwork = () => {
  const Get = async function (endpoint) {
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
      if (res.status === 200) {
        const json = await res.json()
        return json
      } else {
        return {}
      }
    } catch (e) {
      console.log('GET ' + endpoint, e)
      return {}
    }
  }

  const Post = async function (endpoint, payload) {
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
      console.log('POST ' + endpoint, JSON.stringify(payload, null, 2), e)
      return {status: 'error', error: 'server_error'}
    }
  }

  const SocketSend = async (
    type = '',
    matchId = 0,
    data = {},
    dest = '',
    userId,
    nickname,
    socket,
  ) => {
    const token = await AsyncStorage.getItem('jwt')
    const user = {
      id: userId,
      nickname: nickname,
    }
    const toSend = {
      type: type,
      matchId: matchId,
      timestamp: Date.now(),
      playerId: user.id ?? 0,
      jwt: token ? token : '',
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
