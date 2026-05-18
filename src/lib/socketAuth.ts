import config from '@/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {Platform} from 'react-native'
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

/** Keep in sync with pingTimeout on the Socket.IO server (server.ts). */
export const SOCKET_PING_INTERVAL_MS = 25_000
export const SOCKET_PING_TIMEOUT_MS = 120_000

/** CueChat manages connect/disconnect explicitly — disable auto-reconnect. */
export function createSocketClient(
  url?: string,
  authOptions: Record<string, unknown> = {},
): Socket {
  return io(url || config.webSocketUrl, {
    autoConnect: false,
    reconnection: false,
    timeout: 30_000,
    pingInterval: SOCKET_PING_INTERVAL_MS,
    pingTimeout: SOCKET_PING_TIMEOUT_MS,
    transports: Platform.OS === 'web' ? ['websocket', 'polling'] : ['websocket'],
    ...authOptions,
  })
}
