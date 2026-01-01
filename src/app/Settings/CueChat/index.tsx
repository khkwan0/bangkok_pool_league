import TextInput from '@/components/TextInput'
import { ThemedText as Text } from '@/components/ThemedText'
import { ThemedView as View } from '@/components/ThemedView'
import config from '@/config'
import { useLeagueContext } from '@/context/LeagueContext'
import { useNetwork } from '@/hooks/useNetwork'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View as RNView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { io } from 'socket.io-client'

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
  const {Get, Post} = useNetwork()
  const flatListRef = React.useRef<FlatList>(null)
  const streamingMessageIdRef = React.useRef<string | null>(null)
  
  // Persona state
  const [personas, setPersonas] = React.useState<Array<{id?: number; persona_id?: number; title?: string; name?: string}>>([])
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string>('default')
  const [currentPersonaId, setCurrentPersonaId] = React.useState<number | null>(null)
  const [showPersonaModal, setShowPersonaModal] = React.useState(false)
  const roomId = React.useRef('cuechat')
  const socket = React.useRef(
    io('https://' + config.domain, {autoConnect: false}),
  )

  // Fetch personas and current persona on mount
  React.useEffect(() => {
    async function fetchPersonas() {
      const playerId = leagueState.user?.id
      if (!playerId) {
        return // Don't fetch if user is not authenticated
      }

      try {
        // Fetch all personas first
        const personasResponse = await Get('/personas')
        console.log(JSON.stringify(personasResponse, null, 2))
        let personasList: Array<{id?: number; persona_id?: number; title?: string; name?: string}> = []
        if (personasResponse && personasResponse.status === 'ok' && personasResponse.data) {
          personasList = personasResponse.data
          setPersonas(personasList)
        }

        // Fetch current persona after personas are loaded
        const personaResponse = await Get('/persona')
        if (personaResponse && personaResponse.status === 'ok' && personaResponse.data) {
          const personaId = personaResponse.data.preferred_ai_persona_id
          if (personaId) {
            setCurrentPersonaId(personaId)
            // Check if this persona exists in the personas list
            const personaExists = personasList.some((p: any) => {
              const pId = p.id || p.persona_id
              return pId === personaId
            })
            if (personaExists) {
              setSelectedPersonaId(personaId.toString())
            } else {
              setSelectedPersonaId('default')
            }
          } else {
            setSelectedPersonaId('default')
          }
        } else {
          setSelectedPersonaId('default')
        }
      } catch (e) {
        console.error('Error fetching personas:', e)
        setSelectedPersonaId('default')
      }
    }

    fetchPersonas()
  }, [leagueState.user?.id])

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

  // Handle persona selection change
  const handlePersonaChange = async (personaId: string) => {
    if (personaId === selectedPersonaId) {
      setShowPersonaModal(false)
      return // No change
    }

    setShowPersonaModal(false)

    // If "default" is selected, POST with 0
    if (personaId === 'default') {
      try {
        const response = await Post('/persona', {personaId: 0})
        if (response && response.status === 'ok') {
          setSelectedPersonaId('default')
          setCurrentPersonaId(0)
        } else {
          // Don't update if response is not ok
          console.error('Error updating persona: response not ok', response)
        }
      } catch (e) {
        console.error('Error updating persona:', e)
        // Don't update on error
      }
      return
    }

    // POST the new personaId
    try {
      const response = await Post('/persona', {personaId: parseInt(personaId)})
      if (response && response.status === 'ok') {
        setSelectedPersonaId(personaId)
        setCurrentPersonaId(parseInt(personaId))
      } else {
        // Don't update if response is not ok
        console.error('Error updating persona: response not ok', response)
      }
    } catch (e) {
      console.error('Error updating persona:', e)
      // Don't update on error
    }
  }

  // Get display name for selected persona
  const getSelectedPersonaName = () => {
    if (selectedPersonaId === 'default') {
      return 'Default'
    }
    const persona = personas.find((p: any) => {
      const pId = (p.id || p.persona_id).toString()
      return pId === selectedPersonaId
    })
    return persona ? (persona.title || persona.name) : 'Default'
  }

  React.useEffect(() => {
    // Socket event listeners
    socket.current.on('connect', () => {
      setIsConnected(true)
      JoinRoom()
    })

    socket.current.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.current.on('chat_message_chunk', (data: any) => {
      const chunkType = data.type
      const chunk = data.chunk || ''
      
      if (chunkType === 'content') {
        // If this is the first chunk, create a new message
        if (!streamingMessageIdRef.current) {
          const newMessageId = `stream_${Date.now()}_${Math.random()}`
          streamingMessageIdRef.current = newMessageId
          
          const newMessage: ChatMessage = {
            id: newMessageId,
            message: chunk,
            nickname: data.nickname || data.user?.nickname || data.sender?.nickname || 'Response',
            playerId: data.playerId || data.userId || data.sender?.id || 0,
            timestamp: data.timestamp || Date.now(),
            rawData: data,
            isUserMessage: false,
          }
          
          setMessages(prev => [...prev, newMessage])
          setIsTyping(false) // Hide typing indicator when first chunk arrives
          
          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({animated: true})
          }, 100)
        } else {
          // Append chunk to existing streaming message
          setMessages(prev => 
            prev.map(msg => 
              msg.id === streamingMessageIdRef.current
                ? {...msg, message: msg.message + chunk}
                : msg
            )
          )
          
          // Scroll to bottom as content streams in
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({animated: false})
          }, 50)
        }
      } else if (chunkType === 'done') {
        // Finalize the message
        streamingMessageIdRef.current = null
        setIsTyping(false)
      }
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
      socket.current.off('chat_message_chunk')
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
    streamingMessageIdRef.current = null // Reset streaming message ref for new message

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
    // Handle timestamp - convert to milliseconds if needed
    const timestamp = item.timestamp < 10000000000 ? item.timestamp * 1000 : item.timestamp
    const date = new Date(timestamp)
    
    // Format as 24-hour time (HH:MM) without AM/PM, ensuring colon is properly displayed
    const hours = date.getHours()
    const minutes = date.getMinutes()

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
          <View 
            style={{
              flexDirection: 'row', 
              alignItems: 'center', 
              marginTop: 6,
              backgroundColor: isUserMessage ? userBgColor : apiBgColor,
            }}>
            <Text
              style={{
                color: isUserMessage ? '#bfdbfe' : (isDark ? '#9ca3af' : '#4b5563'),
                fontSize: 12,
                backgroundColor: isUserMessage ? userBgColor : apiBgColor,
              }}>
              {String(hours).padStart(2, '0')}
            </Text>
            <Text
              style={{
                color: isUserMessage ? '#bfdbfe' : (isDark ? '#9ca3af' : '#4b5563'),
                fontSize: 12,
                backgroundColor: isUserMessage ? userBgColor : apiBgColor,
              }}>
              :
            </Text>
            <Text
              style={{
                color: isUserMessage ? '#bfdbfe' : (isDark ? '#9ca3af' : '#4b5563'),
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

        {/* Persona Selection - Only show if authenticated */}
        {leagueState.user?.id && (
          <>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#374151' : '#e5e7eb',
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Text
                  style={{
                    color: isDark ? '#d1d5db' : '#374151',
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                  Persona:
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPersonaModal(true)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}>
                  <Text
                    style={{
                      color: isDark ? '#f3f4f6' : '#1f2937',
                      fontSize: 14,
                    }}>
                    {getSelectedPersonaName()}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={isDark ? '#d1d5db' : '#374151'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Persona Selection Modal */}
            <Modal
          visible={showPersonaModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPersonaModal(false)}>
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'flex-end',
            }}
            onPress={() => setShowPersonaModal(false)}>
            <Pressable
              style={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: '70%',
              }}
              onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#374151' : '#e5e7eb',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: isDark ? '#f3f4f6' : '#1f2937',
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                  Select Persona
                </Text>
                <TouchableOpacity onPress={() => setShowPersonaModal(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? '#d1d5db' : '#374151'}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView 
                style={{maxHeight: 400}}
                contentContainerStyle={{
                  paddingBottom: insets.bottom,
                }}>
                {/* Default Option */}
                <TouchableOpacity
                  onPress={() => handlePersonaChange('default')}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#374151' : '#e5e7eb',
                    backgroundColor:
                      selectedPersonaId === 'default'
                        ? isDark
                          ? '#374151'
                          : '#f3f4f6'
                        : (isDark ? '#1f2937' : '#ffffff'),
                  }}>
                  <View 
                    style={{
                      flexDirection: 'row', 
                      alignItems: 'center',
                      backgroundColor: selectedPersonaId === 'default'
                        ? (isDark ? '#374151' : '#f3f4f6')
                        : (isDark ? '#1f2937' : '#ffffff'),
                    }}>
                    <Text
                      style={{
                        backgroundColor: 'transparent',
                        color: isDark ? '#f3f4f6' : '#1f2937',
                        fontSize: 16,
                        flex: 1,
                      }}>
                      Default
                    </Text>
                    {selectedPersonaId === 'default' && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={isDark ? '#60a5fa' : '#3b82f6'}
                      />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Persona Options */}
                {personas.map((persona: any) => {
                  const personaId = (persona.id || persona.persona_id).toString()
                  const isSelected = selectedPersonaId === personaId
                  return (
                    <TouchableOpacity
                      key={persona.id || persona.persona_id}
                      onPress={() => handlePersonaChange(personaId)}
                      style={{
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: isDark ? '#374151' : '#e5e7eb',
                        backgroundColor: isSelected
                          ? isDark
                            ? '#374151'
                            : '#f3f4f6'
                          : (isDark ? '#1f2937' : '#ffffff'),
                      }}>
                      <View 
                        style={{
                          flexDirection: 'row', 
                          alignItems: 'center',
                          backgroundColor: isSelected
                            ? (isDark ? '#374151' : '#f3f4f6')
                            : (isDark ? '#1f2937' : '#ffffff'),
                        }}>
                        <Text
                          style={{
                            backgroundColor: 'transparent',
                            color: isDark ? '#f3f4f6' : '#1f2937',
                            fontSize: 16,
                            flex: 1,
                          }}>
                          {persona.title || persona.name}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={isDark ? '#60a5fa' : '#3b82f6'}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
          </>
        )}

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
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TextInput
                placeholder="Type a message..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={SendMessage}
                multiline
                maxLength={500}
                textAlignVertical="center"
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

