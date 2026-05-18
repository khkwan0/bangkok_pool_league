import config from '@/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {io, type Socket} from 'socket.io-client'

export async function loadSocketAuth() {
  const token = await AsyncStorage.getItem('jwt')
  if (!token) return {}
  const bearerToken = `Bearer ${token}`
  return {
    auth: {authorization: bearerToken, token},
    extraHeaders: {Authorization: bearerToken},
  }
}

export function createSocketClient(
  url?: string,
  authOptions: Record<string, unknown> = {},
): Socket {
  return io(url || config.webSocketUrl, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    ...authOptions,
  })
}
