import TextInput from '@/components/TextInput'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import config from '@/config'
import {useLeagueContext} from '@/context/LeagueContext'
import {useNetwork} from '@/hooks/useNetwork'
import {Ionicons} from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View as RNView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
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

type JoinStatusType = {
  status: string
}

export default function CueChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputText, setInputText] = React.useState('')
  const [isConnected, setIsConnected] = React.useState(false)
  const [isTyping, setIsTyping] = React.useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false)
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const {state: leagueState}: any = useLeagueContext()
  const {Get} = useNetwork()
  const flatListRef = React.useRef<FlatList>(null)
  const roomId = React.useRef('cuechat')
  const socket = React.useRef(
    io('https://' + config.domain, {autoConnect: false}),
  )

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
          const historyMessages: ChatMessage[] = response.data.map((item: any) => {
            const messageText = 
              item.message || 
              item.data?.message || 
              item.text || 
              item.response || 
              item.content ||
              ''
            
            const messagePlayerId = item.playerId || item.userId || item.sender?.id || 0
            // Check role field to determine if it's a user message (shown on right)
            const isUserMessage = item.role === 'user' || messagePlayerId === playerId

            return {
              id: item.id || item.messageId || `hist_${Date.now()}_${Math.random()}`,
              message: messageText,
              nickname: item.nickname || item.user?.nickname || item.sender?.nickname || (isUserMessage ? 'You' : 'Response'),
              playerId: messagePlayerId,
              timestamp: item.timestamp || item.created_at || item.time || Date.now(),
              rawData: item,
              isUserMessage: isUserMessage,
            }
          })

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
    // Socket event listeners
    socket.current.on('connect', () => {
      setIsConnected(true)
      JoinRoom()
    })

    socket.current.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.current.on('chat_message', (data: any) => {
      setIsTyping(false) // Stop typing indicator when response arrives
      
      // Extract the actual message text from the response
      const messageText = 
        data.message || 
        data.data?.message || 
        data.text || 
        data.response || 
        data.content ||
        (typeof data === 'string' ? data : '')
      
      // Store raw data and create message - this is an API response (left side)
      const messageWithId: ChatMessage = {
        id: data.id || data.messageId || `api_${Date.now()}_${Math.random()}`,
        message: messageText,
        nickname: data.nickname || data.user?.nickname || data.sender?.nickname || 'Response',
        playerId: data.playerId || data.userId || data.sender?.id || 0,
        timestamp: data.timestamp || data.created_at || data.time || Date.now(),
        rawData: data,
        isUserMessage: false,
      }
      
      setMessages(prev => [...prev, messageWithId])
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true})
      }, 100)
    })

    // Connect on mount
    if (!socket.current.connected) {
      socket.current.connect()
    }

    return () => {
      socket.current.disconnect()
      socket.current.off('connect')
      socket.current.off('disconnect')
      socket.current.off('chat_message')
    }
  }, [])

  function JoinRoom() {
    socket.current.emit('join', roomId.current, (status: JoinStatusType) => {
      // Room joined
    })
  }

  async function SendMessage() {
    if (!inputText.trim() || !isConnected) {
      return
    }

    const messageText = inputText.trim()
    const currentUserId = leagueState.user.id ?? 0
    const currentNickname = leagueState.user.nickname ?? 'You'

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
    setIsTyping(true) // Show typing indicator

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true})
    }, 100)

    try {
      const token = await AsyncStorage.getItem('jwt')
      const messageData = {
        type: 'chat_message',
        room: roomId.current,
        timestamp: Date.now(),
        playerId: currentUserId,
        jwt: token ?? 'notoken',
        nickname: currentNickname,
        data: {
          message: messageText,
        },
      }

      if (socket.current.connected) {
        socket.current.emit('chatupdate', messageData)
      } else {
        socket.current.connect()
        socket.current.once('connect', () => {
          socket.current.emit('chatupdate', messageData)
        })
      }
    } catch (e) {
      console.error('Error sending message:', e)
      setIsTyping(false)
    }
  }

  // Background colors - shared across components
  const userBgColor = '#3b82f6' // blue-500
  const apiBgColor = isDark ? '#166534' : '#86efac' // green-800 dark, green-300 light
  const apiTextColor = isDark ? '#f3f4f6' : '#1f2937'

  const renderMessage = ({item}: {item: ChatMessage}) => {
    const isUserMessage = item.isUserMessage || item.playerId === leagueState.user.id
    const date = new Date(item.timestamp)
    const timeString = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    return (
      <View
        className={`mx-4 my-2 ${
          isUserMessage ? 'items-end' : 'items-start'
        }`}>
        <View
          style={{
            backgroundColor: isUserMessage 
              ? userBgColor 
              : apiBgColor,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            maxWidth: '80%',
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
          <Text
            style={{
              color: isUserMessage ? '#ffffff' : apiTextColor,
              fontSize: 16,
            }}>
            {item.message}
          </Text>
          <Text
            style={{
              color: isUserMessage ? '#bfdbfe' : (isDark ? '#9ca3af' : '#4b5563'),
              fontSize: 12,
              marginTop: 6,
            }}>
            {timeString}
          </Text>
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
          ])
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

  const renderTypingIndicator = () => {
    if (!isTyping) return null

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View className="flex-1">
        {/* Connection Status Bar */}
        <View
          className={`px-4 py-2 flex-row items-center justify-center ${
            isConnected
              ? 'bg-green-500 dark:bg-green-600'
              : 'bg-red-500 dark:bg-red-600'
          }`}>
          <Ionicons
            name={isConnected ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color="white"
            style={{marginRight: 8}}
          />
          <Text className="text-white text-xs">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          ListFooterComponent={renderTypingIndicator}
          contentContainerStyle={{
            paddingVertical: 16,
            paddingBottom: insets.bottom + 80,
          }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-8">
              <Text className="opacity-60">No messages yet. Start chatting!</Text>
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
            <View style={{flex: 1}}>
              <TextInput
                placeholder="Type a message..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={SendMessage}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              onPress={SendMessage}
              disabled={!inputText.trim() || !isConnected}
              className={`rounded-full p-3 ${
                inputText.trim() && isConnected
                  ? 'bg-blue-500 dark:bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{
                opacity: inputText.trim() && isConnected ? 1 : 0.5,
              }}>
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && isConnected ? 'white' : 'gray'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

