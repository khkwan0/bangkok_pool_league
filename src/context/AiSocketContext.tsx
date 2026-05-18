import {useLeagueContext} from '@/context/LeagueContext'
import {createSocketClient, loadSocketAuth} from '@/lib/socketAuth'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {type Socket} from 'socket.io-client'

export type AiSocketConnectionPhase =
  | 'initializing'
  | 'connecting'
  | 'connected'
  | 'disconnected'

type AiSocketContextType = {
  socket: Socket | null
  connectionPhase: AiSocketConnectionPhase
  socketError: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => void
  disconnect: () => void
  ensureConnected: () => Promise<Socket>
}

const AiSocketContext = createContext<AiSocketContextType | null>(null)

export function AiSocketProvider({children}: {children: React.ReactNode}) {
  const {webSocketUrl, state: leagueState} = useLeagueContext()
  const userId = leagueState.user?.id
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionPhase, setConnectionPhase] =
    useState<AiSocketConnectionPhase>('initializing')
  const [socketError, setSocketError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    let cancelled = false
    let activeSocket: Socket | null = null

    async function setupSocket() {
      setConnectionPhase('initializing')
      setSocketError(null)

      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setSocket(null)

      const authOptions = await loadSocketAuth()
      if (cancelled) return

      activeSocket = createSocketClient(webSocketUrl, authOptions)

      activeSocket.on('connect', () => {
        setConnectionPhase('connected')
        setSocketError(null)
      })

      activeSocket.on('disconnect', () => {
        setConnectionPhase('disconnected')
      })

      activeSocket.on('connect_error', (error: Error) => {
        console.error('AI socket connection error:', error.message)
        setConnectionPhase('disconnected')
        setSocketError(error.message || 'Socket connection failed')
      })

      socketRef.current = activeSocket
      setSocket(activeSocket)
      setConnectionPhase('disconnected')
    }

    setupSocket()

    return () => {
      cancelled = true
      if (activeSocket) {
        activeSocket.removeAllListeners()
        activeSocket.disconnect()
      }
      if (socketRef.current === activeSocket) {
        socketRef.current = null
      }
      setSocket(null)
    }
  }, [webSocketUrl])

  useEffect(() => {
    const currentSocket = socketRef.current
    if (!currentSocket) return

    if (!userId) {
      if (currentSocket.connected) {
        currentSocket.disconnect()
      }
      setConnectionPhase('disconnected')
      return
    }

    if (currentSocket.connected) return

    setConnectionPhase('connecting')
    currentSocket.connect()
  }, [userId, socket])

  const connect = useCallback(() => {
    const currentSocket = socketRef.current
    if (!currentSocket || !userId || currentSocket.connected) return
    setConnectionPhase('connecting')
    currentSocket.connect()
  }, [userId])

  const disconnect = useCallback(() => {
    const currentSocket = socketRef.current
    if (!currentSocket) return
    currentSocket.disconnect()
  }, [])

  const ensureConnected = useCallback(() => {
    const currentSocket = socketRef.current
    if (!currentSocket) {
      return Promise.reject(new Error('AI socket not initialized'))
    }
    if (!userId) {
      return Promise.reject(new Error('User is not logged in'))
    }
    if (currentSocket.connected) {
      return Promise.resolve(currentSocket)
    }
    return new Promise<Socket>((resolve, reject) => {
      const onConnect = () => {
        currentSocket.off('connect_error', onError)
        resolve(currentSocket)
      }
      const onError = (error: Error) => {
        currentSocket.off('connect', onConnect)
        reject(error)
      }
      currentSocket.once('connect', onConnect)
      currentSocket.once('connect_error', onError)
      connect()
    })
  }, [connect, userId])

  const isConnecting =
    connectionPhase === 'initializing' || connectionPhase === 'connecting'

  const value = useMemo(
    (): AiSocketContextType => ({
      socket,
      connectionPhase,
      socketError,
      isConnected: connectionPhase === 'connected',
      isConnecting,
      connect,
      disconnect,
      ensureConnected,
    }),
    [
      socket,
      connectionPhase,
      socketError,
      isConnecting,
      connect,
      disconnect,
      ensureConnected,
    ],
  )

  return (
    <AiSocketContext.Provider value={value}>
      {children}
    </AiSocketContext.Provider>
  )
}

export function useAiSocketContext(): AiSocketContextType {
  const context = useContext(AiSocketContext)
  if (!context) {
    throw new Error('useAiSocketContext must be used within AiSocketProvider')
  }
  return context
}
