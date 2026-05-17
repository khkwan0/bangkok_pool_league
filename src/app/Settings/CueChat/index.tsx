import {ChatMarkdown, markdownContainsTable} from '@/components/ChatMarkdown'
import TextInput from '@/components/TextInput'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import config from '@/config'
import {useLeagueContext} from '@/context/LeagueContext'
import {useNetwork} from '@/hooks/useNetwork'
import {Ionicons} from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {Stack} from 'expo-router'
import React from 'react'
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View as RNView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useTranslation} from 'react-i18next'
import {io} from 'socket.io-client'

type ChatMessage = {
  id: string
  message: string
  nickname: string
  playerId: number
  timestamp: number
  rawData?: any
  isUserMessage?: boolean
}

export default function CueChat() {
  const {t} = useTranslation()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputText, setInputText] = React.useState('')
  const [isConnected, setIsConnected] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [responseText, setResponseText] = React.useState('')
  const [reasoningText, setReasoningText] = React.useState('')
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false)
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const {state: leagueState, webSocketUrl}: any = useLeagueContext()
  const {Get} = useNetwork()
  const flatListRef = React.useRef<FlatList>(null)
  const responseBufferRef = React.useRef('')
  const activeRequestIdRef = React.useRef<string | null>(null)
  const socket = React.useRef<ReturnType<typeof io> | null>(null)

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

  React.useEffect(() => {
    let cancelled = false
    let currentSocket: ReturnType<typeof io> | null = null

    async function setupSocket() {
      if (socket.current) {
        socket.current.removeAllListeners()
        socket.current.disconnect()
      }

      const token = await AsyncStorage.getItem('jwt')
      if (cancelled) return

      currentSocket = io(webSocketUrl ?? config.webSocketUrl, {
        autoConnect: false,
        transports: ['websocket', 'polling'],
        ...(token ? {extraHeaders: {Authorization: `Bearer ${token}`}} : {}),
      })
      socket.current = currentSocket

      const isCurrentRequest = (requestId?: string) =>
        !requestId || requestId === activeRequestIdRef.current

      const handleConnect = () => {
        setIsConnected(true)
      }

      const handleDisconnect = () => {
        setIsConnected(false)
      }

      const handleConnectError = (error: Error) => {
        console.error('CueChat socket connection error:', error.message)
        setIsConnected(false)
        setIsStreaming(false)
      }

      const handleAgentReasoningToken = (payload: {
        requestId?: string
        token?: string
      }) => {
        if (!isCurrentRequest(payload?.requestId)) return
        const token = typeof payload?.token === 'string' ? payload.token : ''
        if (!token) return
        setReasoningText(prev => prev + token)
      }

      const handleAgentToken = (payload: {
        requestId?: string
        token?: string
      }) => {
        if (!isCurrentRequest(payload?.requestId)) return
        const token = typeof payload?.token === 'string' ? payload.token : ''
        if (!token) return
        responseBufferRef.current += token
        setResponseText(prev => prev + token)
      }

      const handleAgentDone = (payload: {
        requestId?: string
        response?: {content?: string}
      }) => {
        if (!isCurrentRequest(payload?.requestId)) return

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
      }

      const handleAgentError = (payload: {
        requestId?: string
        error?: string
        message?: string
      }) => {
        if (!isCurrentRequest(payload?.requestId)) return
        responseBufferRef.current = ''
        activeRequestIdRef.current = null
        setResponseText('')
        setReasoningText('')
        setIsStreaming(false)
        console.error(
          'CueChat agent error:',
          payload?.error || payload?.message || 'Agent request failed',
        )
      }

      currentSocket.on('connect', handleConnect)
      currentSocket.on('disconnect', handleDisconnect)
      currentSocket.on('connect_error', handleConnectError)
      currentSocket.on('agent:reasoning_token', handleAgentReasoningToken)
      currentSocket.on('agent:token', handleAgentToken)
      currentSocket.on('agent:done', handleAgentDone)
      currentSocket.on('agent:error', handleAgentError)

      currentSocket.connect()
    }

    setupSocket()

    return () => {
      cancelled = true
      if (currentSocket) {
        currentSocket.removeAllListeners()
        currentSocket.disconnect()
      }
      socket.current = null
    }
  }, [webSocketUrl])

  function emitAgentRequest(
    requestId: string,
    agentMessages: Array<{role: 'system' | 'user' | 'assistant'; content: string}>,
  ) {
    const currentSocket = socket.current
    if (!currentSocket) return

    const payload = {requestId, messages: agentMessages}

    const onAck = (ack?: {status?: string; error?: string}) => {
      if (ack?.status === 'error') {
        activeRequestIdRef.current = null
        responseBufferRef.current = ''
        setResponseText('')
        setReasoningText('')
        setIsStreaming(false)
        console.error('CueChat agent ack error:', ack.error || 'Failed to start agent request')
      }
    }

    if (currentSocket.connected) {
      currentSocket.emit('agent', payload, onAck)
    } else {
      currentSocket.connect()
      currentSocket.once('connect', () => {
        currentSocket.emit('agent', payload, onAck)
      })
    }
  }

  const isInputEnabled = isConnected && !isStreaming
  const canSend = isInputEnabled && Boolean(inputText.trim())
  const inputPlaceholder = !isConnected
    ? t('ai_assistant_input_disconnected')
    : isStreaming
      ? t('ai_assistant_input_responding')
      : t('ai_assistant_message_placeholder')

  async function SendMessage() {
    if (!canSend) {
      return
    }

    const messageText = inputText.trim()
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
    responseBufferRef.current = ''
    setResponseText('')
    setReasoningText('')
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
    setInputText('')

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
        style={!isUserMessage && hasTable ? {alignItems: 'stretch'} : undefined}>
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

    const hasTable = markdownContainsTable(responseText)

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
            paddingHorizontal: hasTable ? 8 : 16,
            paddingVertical: 12,
            maxWidth: hasTable ? '96%' : '80%',
            alignSelf: hasTable ? 'stretch' : 'flex-start',
            overflow: 'visible',
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
          <ChatMarkdown content={responseText} textColor={apiTextColor} />
        </RNView>
      </RNView>
    )
  }

  const renderTypingIndicator = () => {
    if (
      !isStreaming ||
      reasoningText.trim() ||
      responseText.trim()
    ) {
      return null
    }

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
            backgroundColor: isConnected ? '#16a34a' : '#dc2626',
          }}>
          <Ionicons
            name={isConnected ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color="white"
            style={{marginRight: 8}}
          />
          <Text style={{color: '#ffffff', fontSize: 12}}>
            {isConnected ? t('connected') : t('disconnected')}
          </Text>
        </View>

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
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-8">
              <Text className="opacity-60">{t('ai_assistant_empty')}</Text>
            </View>
          }
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
                onSubmitEditing={SendMessage}
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
              onPress={SendMessage}
              disabled={!canSend}
              className={`rounded-full p-3 ${
                canSend ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
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
