import {ChatMarkdown, markdownContainsTable} from '@/components/ChatMarkdown'
import TextInput from '@/components/TextInput'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeagueContext} from '@/context/LeagueContext'
import {useNetwork} from '@/hooks/useNetwork'
import {createSocketClient, loadSocketAuth} from '@/lib/socketAuth'
import {Ionicons} from '@expo/vector-icons'
import {useFocusEffect} from '@react-navigation/native'
import {Stack} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View as RNView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

type ChatMessage = {
  id: string
  message: string
  nickname: string
  playerId: number
  timestamp: number
  rawData?: any
  isUserMessage?: boolean
}

type ConnectionPhase =
  | 'initializing'
  | 'connecting'
  | 'connected'
  | 'disconnected'

type AgentActivity =
  | {phase: 'reconnecting'}
  | {phase: 'sending'}
  | {phase: 'preparing'}
  | {phase: 'tool'; toolName: string}

type ToolCallPayload = {
  requestId?: string
  toolCall?: {
    name?: string
    function?: {name?: string}
  }
}

function resolveToolCallName(payload: ToolCallPayload): string {
  const toolCall = payload?.toolCall
  if (!toolCall) return 'tool'
  if (typeof toolCall.name === 'string' && toolCall.name.trim()) {
    return toolCall.name.trim()
  }
  const functionName = toolCall.function?.name
  if (typeof functionName === 'string' && functionName.trim()) {
    return functionName.trim()
  }
  return 'tool'
}

function formatToolDisplayName(rawName: string): string {
  const cleaned = rawName
    .replace(/^bkk_?league_?/i, '')
    .replace(/_/g, ' ')
    .trim()
  if (!cleaned) return rawName
  return cleaned.replace(/\b\w/g, char => char.toUpperCase())
}

export default function CueChat() {
  const {t} = useTranslation()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputText, setInputText] = React.useState('')
  const [agentActivity, setAgentActivity] =
    React.useState<AgentActivity | null>(null)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [responseText, setResponseText] = React.useState('')
  const [reasoningText, setReasoningText] = React.useState('')
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false)
  const [agentError, setAgentError] = React.useState<string | null>(null)
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const {state: leagueState, webSocketUrl}: any = useLeagueContext()
  const {Get} = useNetwork()
  const [connectionPhase, setConnectionPhase] =
    React.useState<ConnectionPhase>('initializing')
  const [socketError, setSocketError] = React.useState<string | null>(null)
  const flatListRef = React.useRef<FlatList>(null)
  const socketRef = React.useRef<ReturnType<typeof createSocketClient> | null>(
    null,
  )
  const responseBufferRef = React.useRef('')
  const pendingResponseTokensRef = React.useRef('')
  const pendingReasoningTokensRef = React.useRef('')
  const responseFlushRafRef = React.useRef<number | null>(null)
  const reasoningFlushRafRef = React.useRef<number | null>(null)
  const activeRequestIdRef = React.useRef<string | null>(null)

  const isConnected = connectionPhase === 'connected'
  const isConnecting =
    connectionPhase === 'initializing' || connectionPhase === 'connecting'
  const displayError = agentError ?? socketError

  const ensureConnected = React.useCallback(() => {
    const currentSocket = socketRef.current
    if (!currentSocket) {
      return Promise.reject(new Error('Socket not initialized'))
    }
    if (!leagueState.user?.id) {
      return Promise.reject(new Error('User is not logged in'))
    }
    if (currentSocket.connected) {
      return Promise.resolve(currentSocket)
    }
    return new Promise<NonNullable<typeof currentSocket>>((resolve, reject) => {
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
      setConnectionPhase('connecting')
      currentSocket.connect()
    })
  }, [leagueState.user?.id])

  function clearAgentActivity() {
    setAgentActivity(null)
  }

  function teardownSocket(
    pendingSocket: ReturnType<typeof createSocketClient> | null = null,
  ) {
    const requestId = activeRequestIdRef.current
    const sockets = new Set(
      [pendingSocket, socketRef.current].filter(
        (socket): socket is NonNullable<typeof socket> => socket != null,
      ),
    )

    for (const socket of sockets) {
      if (socket.connected && requestId) {
        socket.emit('agent:cancel', {requestId})
      }
      socket.removeAllListeners()
      socket.disconnect()
    }

    socketRef.current = null

    if (responseFlushRafRef.current != null) {
      cancelAnimationFrame(responseFlushRafRef.current)
      responseFlushRafRef.current = null
    }
    if (reasoningFlushRafRef.current != null) {
      cancelAnimationFrame(reasoningFlushRafRef.current)
      reasoningFlushRafRef.current = null
    }

    activeRequestIdRef.current = null
    responseBufferRef.current = ''
    pendingResponseTokensRef.current = ''
    pendingReasoningTokensRef.current = ''
    setResponseText('')
    setReasoningText('')
    setIsStreaming(false)
    clearAgentActivity()
    setConnectionPhase('disconnected')
  }

  function flushPendingResponseTokens() {
    responseFlushRafRef.current = null
    const chunk = pendingResponseTokensRef.current
    if (!chunk) return
    pendingResponseTokensRef.current = ''
    responseBufferRef.current += chunk
    setResponseText(prev => prev + chunk)
  }

  function flushPendingReasoningTokens() {
    reasoningFlushRafRef.current = null
    const chunk = pendingReasoningTokensRef.current
    if (!chunk) return
    pendingReasoningTokensRef.current = ''
    setReasoningText(prev => prev + chunk)
  }

  function scheduleResponseTokenFlush() {
    if (responseFlushRafRef.current != null) return
    responseFlushRafRef.current = requestAnimationFrame(
      flushPendingResponseTokens,
    )
  }

  function scheduleReasoningTokenFlush() {
    if (reasoningFlushRafRef.current != null) return
    reasoningFlushRafRef.current = requestAnimationFrame(
      flushPendingReasoningTokens,
    )
  }

  function appendResponseToken(token: string) {
    pendingResponseTokensRef.current += token
    scheduleResponseTokenFlush()
  }

  function appendReasoningToken(token: string) {
    pendingReasoningTokensRef.current += token
    scheduleReasoningTokenFlush()
  }

  function flushAllPendingStreamTokens() {
    if (responseFlushRafRef.current != null) {
      cancelAnimationFrame(responseFlushRafRef.current)
      responseFlushRafRef.current = null
    }
    if (reasoningFlushRafRef.current != null) {
      cancelAnimationFrame(reasoningFlushRafRef.current)
      reasoningFlushRafRef.current = null
    }
    const responseChunk = pendingResponseTokensRef.current
    const reasoningChunk = pendingReasoningTokensRef.current
    pendingResponseTokensRef.current = ''
    pendingReasoningTokensRef.current = ''
    if (responseChunk) {
      responseBufferRef.current += responseChunk
      setResponseText(prev => prev + responseChunk)
    }
    if (reasoningChunk) {
      setReasoningText(prev => prev + reasoningChunk)
    }
  }

  function formatToolStatusLabel(rawToolName: string): string {
    const tool = formatToolDisplayName(rawToolName)
    let prefix = t('ai_assistant_status_tool_prefix', {
      defaultValue: 'Looking up',
    })
    const braceIndex = prefix.indexOf('{')
    if (braceIndex >= 0) {
      prefix = prefix.slice(0, braceIndex).trim()
    }
    if (!prefix) prefix = 'Looking up'
    return `${prefix} ${tool}…`
  }

  function getAgentActivityLabel(
    activity: AgentActivity | null,
  ): string | null {
    if (!activity) return null
    switch (activity.phase) {
      case 'reconnecting':
        return t('ai_assistant_status_reconnecting')
      case 'sending':
        return t('ai_assistant_status_sending')
      case 'preparing':
        return t('ai_assistant_status_preparing')
      case 'tool':
        return formatToolStatusLabel(activity.toolName)
      default:
        return null
    }
  }

  function getStreamingStatusLabel(): string {
    const activityLabel = getAgentActivityLabel(agentActivity)
    if (activityLabel) return activityLabel
    if (reasoningText.trim() && !responseText.trim()) {
      return t('ai_assistant_status_reasoning')
    }
    if (responseText.trim()) {
      return t('ai_assistant_status_responding')
    }
    return t('ai_assistant_status_preparing')
  }

  function getStatusBarLabel(): string {
    if (isLoadingHistory && !isConnected) {
      return t('ai_assistant_status_connecting')
    }
    if (isStreaming) {
      return getStreamingStatusLabel()
    }
    switch (connectionPhase) {
      case 'initializing':
        return t('ai_assistant_status_initializing')
      case 'connecting':
        return t('ai_assistant_status_connecting')
      case 'connected':
        return t('connected')
      case 'disconnected':
        return t('disconnected')
      default:
        return t('disconnected')
    }
  }

  function getStatusBarColor(): string {
    if (isStreaming) return '#2563eb'
    switch (connectionPhase) {
      case 'initializing':
      case 'connecting':
        return '#ca8a04'
      case 'connected':
        return '#16a34a'
      case 'disconnected':
        return '#dc2626'
      default:
        return '#dc2626'
    }
  }

  function getStatusBarIcon(): keyof typeof Ionicons.glyphMap {
    if (agentActivity?.phase === 'reconnecting') return 'sync-outline'
    if (isStreaming) {
      return agentActivity?.phase === 'tool' ? 'search-outline' : 'hourglass-outline'
    }
    switch (connectionPhase) {
      case 'initializing':
      case 'connecting':
        return 'sync-outline'
      case 'connected':
        return 'checkmark-circle'
      case 'disconnected':
        return 'close-circle'
      default:
        return 'close-circle'
    }
  }

  React.useEffect(() => {
    return () => {
      if (responseFlushRafRef.current != null) {
        cancelAnimationFrame(responseFlushRafRef.current)
      }
      if (reasoningFlushRafRef.current != null) {
        cancelAnimationFrame(reasoningFlushRafRef.current)
      }
    }
  }, [])

  // Fetch chat history on mount
  React.useEffect(() => {
    async function fetchChatHistory() {
      const playerId = leagueState.user?.id
      if (!playerId) {
        return // Don't fetch if user is not authenticated
      }

      try {
        setIsLoadingHistory(true)
        const response = await Get('chat/history')

        if (response && response.status === 'ok' && response.data) {
          // Parse history messages and add to state
          const historyMessages: ChatMessage[] = response.data.map(
            (item: any) => {
              const messageText =
                item.message ||
                item.data?.message ||
                item.text ||
                item.response ||
                item.content ||
                ''

              const messagePlayerId =
                item.playerId || item.userId || item.sender?.id || 0
              // Check role field to determine if it's a user message (shown on right)
              const isUserMessage =
                item.role === 'user' || messagePlayerId === playerId

              return {
                id:
                  item.id ||
                  item.messageId ||
                  `hist_${Date.now()}_${Math.random()}`,
                message: messageText,
                nickname:
                  item.nickname ||
                  item.user?.nickname ||
                  item.sender?.nickname ||
                  (isUserMessage ? 'You' : 'Response'),
                playerId: messagePlayerId,
                timestamp:
                  item.timestamp || item.created_at || item.time || Date.now(),
                rawData: item,
                isUserMessage: isUserMessage,
              }
            },
          )

          // Sort by timestamp to ensure chronological order
          historyMessages.sort((a, b) => a.timestamp - b.timestamp)

          setMessages(historyMessages)

          // Scroll to bottom after loading history
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({animated: false})
          }, 100)
        }
      } catch (e) {
        console.error('Error fetching chat history:', e)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchChatHistory()
  }, [leagueState.user?.id])

  React.useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true})
    }, 50)
  }, [reasoningText, responseText, isStreaming, messages.length])

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false
      let activeSocket: ReturnType<typeof createSocketClient> | null = null

      async function setupSocket() {
        setConnectionPhase('initializing')
        setSocketError(null)

        teardownSocket()

        const authOptions = await loadSocketAuth()
        if (cancelled) return

        activeSocket = createSocketClient(webSocketUrl, authOptions)
        if (cancelled) {
          activeSocket.removeAllListeners()
          activeSocket.disconnect()
          return
        }

      activeSocket.on('connect', () => {
        setConnectionPhase('connected')
        setSocketError(null)
      })

      activeSocket.on('disconnect', () => {
        setConnectionPhase('disconnected')
      })

      activeSocket.on('connect_error', (error: Error) => {
        console.error('CueChat socket connection error:', error.message)
        setConnectionPhase('disconnected')
        setSocketError(error.message || 'Socket connection failed')
        setIsStreaming(false)
        clearAgentActivity()
      })

      const isCurrentRequest = (requestId?: string) =>
        !requestId || requestId === activeRequestIdRef.current

      const handleAgentReasoningToken = (payload: {
      requestId?: string
      token?: string
    }) => {
      if (!isCurrentRequest(payload?.requestId)) return
      const tokenValue = typeof payload?.token === 'string' ? payload.token : ''
      if (!tokenValue) return
      clearAgentActivity()
      appendReasoningToken(tokenValue)
    }

    const handleAgentToken = (payload: {
      requestId?: string
      token?: string
    }) => {
      if (!isCurrentRequest(payload?.requestId)) return
      const tokenValue = typeof payload?.token === 'string' ? payload.token : ''
      if (!tokenValue) return
      clearAgentActivity()
      appendResponseToken(tokenValue)
    }

    const handleAgentToolCall = (payload: ToolCallPayload) => {
      if (!isCurrentRequest(payload?.requestId)) return
      setAgentActivity({phase: 'tool', toolName: resolveToolCallName(payload)})
    }

    const handleAgentDone = (payload: {
      requestId?: string
      response?: {content?: string}
    }) => {
      if (!isCurrentRequest(payload?.requestId)) return

      flushAllPendingStreamTokens()

      let assistantReply = responseBufferRef.current.trim()
      if (!assistantReply) {
        const responseContent = payload?.response?.content
        assistantReply =
          typeof responseContent === 'string' ? responseContent.trim() : ''
      }

      if (assistantReply) {
        setMessages(prev => [
          ...prev,
          {
            id: `assistant_${Date.now()}_${Math.random()}`,
            message: assistantReply,
            nickname: 'Response',
            playerId: 0,
            timestamp: Date.now(),
            isUserMessage: false,
          },
        ])
      }

      responseBufferRef.current = ''
      activeRequestIdRef.current = null
      setResponseText('')
      setReasoningText('')
      setIsStreaming(false)
      clearAgentActivity()
      setAgentError(null)
    }

    const handleAgentError = (payload: {
      requestId?: string
      error?: string
      message?: string
    }) => {
      if (!isCurrentRequest(payload?.requestId)) return
      flushAllPendingStreamTokens()
      responseBufferRef.current = ''
      pendingResponseTokensRef.current = ''
      pendingReasoningTokensRef.current = ''
      activeRequestIdRef.current = null
      setResponseText('')
      setReasoningText('')
      setIsStreaming(false)
      clearAgentActivity()
      const message =
        payload?.error || payload?.message || 'Agent request failed'
      setAgentError(message)
      console.error('CueChat agent error:', message)
      }

      activeSocket.on('agent:reasoning_token', handleAgentReasoningToken)
      activeSocket.on('agent:token', handleAgentToken)
      activeSocket.on('agent:tool_call', handleAgentToolCall)
      activeSocket.on('agent:done', handleAgentDone)
      activeSocket.on('agent:error', handleAgentError)

      socketRef.current = activeSocket

      if (leagueState.user?.id) {
        setConnectionPhase('connecting')
        activeSocket.connect()
      } else {
        setConnectionPhase('disconnected')
      }
    }

      setupSocket()

      return () => {
        cancelled = true
        teardownSocket(activeSocket)
      }
    }, [webSocketUrl, leagueState.user?.id]),
  )

  async function emitAgentRequest(
    requestId: string,
    agentMessages: Array<{
      role: 'system' | 'user' | 'assistant'
      content: string
    }>,
  ) {
    const socket = socketRef.current
    if (!socket) return

    const payload = {requestId, messages: agentMessages}

    const onAck = (ack?: {status?: string; error?: string}) => {
      if (ack?.status === 'error') {
        activeRequestIdRef.current = null
        responseBufferRef.current = ''
        setResponseText('')
        setReasoningText('')
        setIsStreaming(false)
        clearAgentActivity()
        setAgentError(ack.error || 'Failed to start agent request')
        console.error(
          'CueChat agent ack error:',
          ack.error || 'Failed to start agent request',
        )
      }
    }

    const emitPayload = () => {
      setAgentActivity({phase: 'preparing'})
      socket.emit('agent', payload, onAck)
    }

    try {
      if (socket.connected) {
        setAgentActivity({phase: 'sending'})
        emitPayload()
      } else {
        setAgentActivity({phase: 'reconnecting'})
        await ensureConnected()
        setAgentActivity({phase: 'sending'})
        emitPayload()
      }
    } catch (error) {
      setIsStreaming(false)
      clearAgentActivity()
      const message =
        error instanceof Error ? error.message : 'Socket connection failed'
      setAgentError(message)
    }
  }

  const isInputEnabled = isConnected && !isStreaming && !isConnecting
  const canSend = isInputEnabled && Boolean(inputText.trim())
  const inputPlaceholder = isConnecting
    ? t('ai_assistant_input_connecting')
    : !isConnected
      ? t('ai_assistant_input_disconnected')
      : isStreaming
        ? t('ai_assistant_input_responding')
        : t('ai_assistant_message_placeholder')

  const suggestionKeys = [
    'ai_assistant_suggestion_1',
    'ai_assistant_suggestion_2',
    'ai_assistant_suggestion_3',
    'ai_assistant_suggestion_4',
  ] as const

  const showReadyPrompt =
    isConnected &&
    !isConnecting &&
    !isStreaming &&
    !isLoadingHistory &&
    messages.length === 0

  async function SendMessage(overrideText?: string) {
    const messageText = (overrideText ?? inputText).trim()
    if (!messageText) return
    if (!overrideText && !canSend) return
    if (overrideText && !isInputEnabled) return
    const currentUserId = leagueState.user.id ?? 0
    const currentNickname = leagueState.user.nickname ?? 'You'

    const historyTurns = messages
      .filter(item => item.message.trim())
      .map(item => ({
        role: (item.isUserMessage || item.playerId === currentUserId
          ? 'user'
          : 'assistant') as 'user' | 'assistant',
        content: item.message,
      }))

    const agentMessages = [
      {
        role: 'system' as const,
        content: currentUserId
          ? `You are assisting BKK League player_id=${currentUserId}. Personalize recommendations to this player's context, match planning needs, and likely league workflows.`
          : 'You are assisting a BKK League player. Personalize recommendations to match planning, team coordination, and league workflows.',
      },
      ...historyTurns,
      {role: 'user' as const, content: messageText},
    ]

    const requestId = `ai-${Date.now()}`
    activeRequestIdRef.current = requestId
    if (responseFlushRafRef.current != null) {
      cancelAnimationFrame(responseFlushRafRef.current)
      responseFlushRafRef.current = null
    }
    if (reasoningFlushRafRef.current != null) {
      cancelAnimationFrame(reasoningFlushRafRef.current)
      reasoningFlushRafRef.current = null
    }
    responseBufferRef.current = ''
    pendingResponseTokensRef.current = ''
    pendingReasoningTokensRef.current = ''
    setResponseText('')
    setReasoningText('')
    setAgentError(null)
    setAgentActivity({phase: 'sending'})
    setIsStreaming(true)

    // Add user message to chat immediately (right side)
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${Math.random()}`,
      message: messageText,
      nickname: currentNickname,
      playerId: currentUserId,
      timestamp: Date.now(),
      isUserMessage: true,
    }

    setMessages(prev => [...prev, userMessage])
    if (!overrideText) {
      setInputText('')
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true})
    }, 100)

    try {
      emitAgentRequest(requestId, agentMessages)
    } catch (e) {
      console.error('Error sending message:', e)
      activeRequestIdRef.current = null
      responseBufferRef.current = ''
      setResponseText('')
      setReasoningText('')
      setIsStreaming(false)
      clearAgentActivity()
    }
  }

  // Background colors - shared across components
  const userBgColor = '#3b82f6' // blue-500
  const apiBgColor = isDark ? '#166534' : '#86efac' // green-800 dark, green-300 light
  const apiTextColor = isDark ? '#f3f4f6' : '#1f2937'

  const renderMessage = ({item}: {item: ChatMessage}) => {
    const isUserMessage =
      item.isUserMessage || item.playerId === leagueState.user.id
    const hasTable = !isUserMessage && markdownContainsTable(item.message)
    // Handle timestamp - convert to milliseconds if needed
    const timestamp =
      item.timestamp < 10000000000 ? item.timestamp * 1000 : item.timestamp
    const date = new Date(timestamp)

    // Format as 24-hour time (HH:MM) without AM/PM, ensuring colon is properly displayed
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return (
      <View
        className={`mx-4 my-2 ${isUserMessage ? 'items-end' : hasTable ? '' : 'items-start'}`}
        style={
          !isUserMessage && hasTable ? {alignItems: 'stretch'} : undefined
        }>
        <View
          style={{
            backgroundColor: isUserMessage ? userBgColor : apiBgColor,
            borderRadius: 16,
            paddingHorizontal: hasTable ? 8 : 16,
            paddingVertical: 12,
            maxWidth: hasTable ? '96%' : '80%',
            alignSelf: hasTable ? 'stretch' : undefined,
            overflow: hasTable ? 'visible' : 'hidden',
          }}>
          {!isUserMessage && (
            <Text
              style={{
                color: isDark ? '#d1d5db' : '#374151',
                fontSize: 12,
                marginBottom: 6,
                fontWeight: '600',
              }}>
              {item.nickname}
            </Text>
          )}
          {isUserMessage ? (
            <Text
              style={{
                color: '#ffffff',
                fontSize: 16,
              }}>
              {item.message}
            </Text>
          ) : (
            <ChatMarkdown content={item.message} textColor={apiTextColor} />
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 6,
              backgroundColor: isUserMessage ? userBgColor : apiBgColor,
            }}>
            <Text
              style={{
                color: isUserMessage
                  ? '#bfdbfe'
                  : isDark
                    ? '#9ca3af'
                    : '#4b5563',
                fontSize: 12,
                backgroundColor: isUserMessage ? userBgColor : apiBgColor,
              }}>
              {String(hours).padStart(2, '0')}
            </Text>
            <Text
              style={{
                color: isUserMessage
                  ? '#bfdbfe'
                  : isDark
                    ? '#9ca3af'
                    : '#4b5563',
                fontSize: 12,
                backgroundColor: isUserMessage ? userBgColor : apiBgColor,
              }}>
              :
            </Text>
            <Text
              style={{
                color: isUserMessage
                  ? '#bfdbfe'
                  : isDark
                    ? '#9ca3af'
                    : '#4b5563',
                fontSize: 12,
                backgroundColor: isUserMessage ? userBgColor : apiBgColor,
              }}>
              {String(minutes).padStart(2, '0')}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  const shouldSpinStatusIcon =
    isConnecting ||
    isStreaming ||
    agentActivity?.phase === 'reconnecting'

  const StatusBarIcon = ({
    name,
    spin,
  }: {
    name: keyof typeof Ionicons.glyphMap
    spin: boolean
  }) => {
    const rotation = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      if (!spin) {
        rotation.stopAnimation()
        rotation.setValue(0)
        return
      }

      const animation = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      )
      animation.start()
      return () => animation.stop()
    }, [spin, rotation])

    const rotate = rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    })

    return (
      <Animated.View style={{marginRight: 8, transform: [{rotate}]}}>
        <Ionicons name={name} size={16} color="white" />
      </Animated.View>
    )
  }

  const BouncingDots = () => {
    const dot1 = React.useRef(new Animated.Value(0)).current
    const dot2 = React.useRef(new Animated.Value(0)).current
    const dot3 = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      const animateDot = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: -8,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        )
      }

      const animations = [
        animateDot(dot1, 0),
        animateDot(dot2, 150),
        animateDot(dot3, 300),
      ]

      animations.forEach(anim => anim.start())

      return () => {
        animations.forEach(anim => anim.stop())
      }
    }, [])

    const dotColor = isDark ? '#f3f4f6' : '#1f2937'

    return (
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: dotColor,
            transform: [{translateY: dot1}],
          }}
        />
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: dotColor,
            transform: [{translateY: dot2}],
          }}
        />
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: dotColor,
            transform: [{translateY: dot3}],
          }}
        />
      </View>
    )
  }

  const reasoningBgColor = isDark ? '#1f2937' : '#f3f4f6'
  const reasoningBorderColor = isDark ? '#374151' : '#e5e7eb'
  const reasoningTextColor = isDark ? '#d1d5db' : '#4b5563'
  const reasoningLabelColor = isDark ? '#9ca3af' : '#6b7280'

  const renderReasoningIndicator = () => {
    if (!reasoningText.trim()) return null

    return (
      <RNView
        style={{
          marginHorizontal: 16,
          marginVertical: 8,
          alignItems: 'flex-start',
        }}>
        <RNView
          style={{
            backgroundColor: reasoningBgColor,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: reasoningBorderColor,
            paddingHorizontal: 16,
            paddingVertical: 12,
            maxWidth: '90%',
          }}>
          <Text
            style={{
              color: reasoningLabelColor,
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
            {t('ai_assistant_reasoning_label')}
          </Text>
          <ScrollView style={{maxHeight: 120}} nestedScrollEnabled>
            <Text
              style={{
                color: reasoningTextColor,
                fontSize: 13,
                lineHeight: 20,
              }}>
              {reasoningText}
            </Text>
          </ScrollView>
        </RNView>
      </RNView>
    )
  }

  const renderStreamingResponse = () => {
    if (!isStreaming || !responseText.trim()) return null

    return (
      <RNView
        style={{
          marginHorizontal: 16,
          marginVertical: 8,
          alignItems: 'stretch',
        }}>
        <RNView
          style={{
            backgroundColor: apiBgColor,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            maxWidth: '80%',
            alignSelf: 'flex-start',
          }}>
          <Text
            style={{
              color: isDark ? '#d1d5db' : '#374151',
              fontSize: 12,
              marginBottom: 6,
              fontWeight: '600',
            }}>
            Response
          </Text>
          <Text style={{color: apiTextColor, fontSize: 16, lineHeight: 22}}>
            {responseText}
          </Text>
        </RNView>
      </RNView>
    )
  }

  const renderTypingIndicator = () => {
    if (!isStreaming || reasoningText.trim() || responseText.trim()) {
      return null
    }

    const activityLabel = getAgentActivityLabel(agentActivity)

    return (
      <RNView
        style={{
          marginHorizontal: 16,
          marginVertical: 8,
          alignItems: 'flex-start',
        }}>
        <RNView
          style={{
            backgroundColor: apiBgColor,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            minHeight: 36,
            justifyContent: 'center',
          }}>
          {activityLabel ? (
            <Text
              style={{
                color: apiTextColor,
                fontSize: 14,
                marginBottom: 8,
                opacity: 0.9,
              }}>
              {activityLabel}
            </Text>
          ) : null}
          <BouncingDots />
        </RNView>
      </RNView>
    )
  }

  const renderListFooter = () => (
    <>
      {renderReasoningIndicator()}
      {renderStreamingResponse()}
      {renderTypingIndicator()}
    </>
  )

  const chipBorderColor = isDark ? '#4b5563' : '#d1d5db'
  const chipBgColor = isDark ? '#1f2937' : '#ffffff'
  const chipTextColor = isDark ? '#e5e7eb' : '#374151'

  const renderReadyPrompt = () => (
    <RNView
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'flex-start',
        width: '100%',
      }}>
      <RNView
        style={{
          backgroundColor: apiBgColor,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
          maxWidth: '90%',
          marginBottom: 12,
        }}>
        <Text
          style={{
            color: isDark ? '#d1d5db' : '#374151',
            fontSize: 12,
            marginBottom: 6,
            fontWeight: '600',
          }}>
          {t('ai_assistant')}
        </Text>
        <Text style={{color: apiTextColor, fontSize: 16, lineHeight: 22}}>
          {t('ai_assistant_ready_message')}
        </Text>
      </RNView>
      <Text
        style={{
          color: reasoningLabelColor,
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 8,
          marginLeft: 4,
        }}>
        {t('ai_assistant_suggestions_label')}
      </Text>
      <RNView style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
        {suggestionKeys.map(key => {
          const label = t(key)
          return (
            <TouchableOpacity
              key={key}
              onPress={() => SendMessage(label)}
              disabled={!isInputEnabled}
              activeOpacity={0.7}
              style={{
                borderWidth: 1,
                borderColor: chipBorderColor,
                backgroundColor: chipBgColor,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 10,
                maxWidth: '100%',
                opacity: isInputEnabled ? 1 : 0.5,
              }}>
              <Text
                style={{color: chipTextColor, fontSize: 14, lineHeight: 20}}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </RNView>
    </RNView>
  )

  const renderListEmpty = () => {
    if (showReadyPrompt) {
      return renderReadyPrompt()
    }
    if (isLoadingHistory) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="opacity-60">
            {t('ai_assistant_input_connecting')}
          </Text>
        </View>
      )
    }
    if (isConnecting) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="opacity-60">
            {t('ai_assistant_input_connecting')}
          </Text>
        </View>
      )
    }
    if (!isConnected) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="opacity-60">
            {t('ai_assistant_input_disconnected')}
          </Text>
        </View>
      )
    }
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Text className="opacity-60">{t('ai_assistant_empty')}</Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen options={{title: t('ai_assistant')}} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View className="flex-1">
          {/* Connection Status Bar */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: getStatusBarColor(),
            }}>
            <StatusBarIcon
              name={getStatusBarIcon()}
              spin={shouldSpinStatusIcon}
            />
            <Text style={{color: '#ffffff', fontSize: 12}}>
              {getStatusBarLabel()}
            </Text>
          </View>

          {displayError ? (
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 8,
                padding: 12,
                borderRadius: 8,
                backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
              }}>
              <Text
                style={{
                  color: isDark ? '#fecaca' : '#b91c1c',
                  fontSize: 13,
                }}>
                {displayError}
              </Text>
            </View>
          ) : null}

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            ListFooterComponent={renderListFooter}
            contentContainerStyle={{
              paddingVertical: 16,
              paddingBottom: insets.bottom + 80,
            }}
            ListEmptyComponent={renderListEmpty()}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({animated: true})
            }}
          />

          {/* Input Area */}
          <View
            className="border-t border-gray-300 dark:border-gray-700"
            style={{
              paddingBottom: insets.bottom,
              backgroundColor: 'transparent',
            }}>
            <View className="flex-row items-center px-4 py-2 gap-2">
              <View style={{flex: 1, justifyContent: 'center'}}>
                <TextInput
                  placeholder={inputPlaceholder}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => SendMessage()}
                  disabled={!isInputEnabled}
                  multiline
                  maxLength={500}
                  textAlignVertical="center"
                  containerStyle={{
                    opacity: isInputEnabled ? 1 : 0.5,
                  }}
                  inputStyle={{
                    height: undefined,
                    minHeight: 48,
                    paddingTop: 12,
                    paddingBottom: 12,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => SendMessage()}
                disabled={!canSend}
                className={`rounded-full p-3 ${
                  canSend
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{
                  opacity: canSend ? 1 : 0.5,
                }}>
                <Ionicons
                  name="send"
                  size={20}
                  color={canSend ? 'white' : 'gray'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  )
}
