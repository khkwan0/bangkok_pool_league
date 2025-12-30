import { Message } from '@/components/Messages/types'
import TextInput from '@/components/TextInput'
import { ThemedText as Text } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useLeagueContext } from '@/context/LeagueContext'
import { useAccount } from '@/hooks/useAccount'
import { useColorScheme } from '@/hooks/useColorScheme'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { useLocalSearchParams } from 'expo-router'
import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function ResponseInput({
  keyboardHeight,
  onLayout,
  onSend,
  disabled,
}: {
  keyboardHeight: number
  onLayout: (height: number) => void
  onSend: (message: string) => void
  disabled: boolean
}) {
  const [replyMessage, setReplyMessage] = React.useState('')
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  // On Android with keyboard, add extra padding for spacing above keyboard
  // On iOS or when keyboard is hidden, use safe area insets
  const bottomPadding = Platform.OS === 'android' && keyboardHeight > 0
    ? 16
    : insets.bottom

  const handleSend = () => {
    if (replyMessage.trim() && !disabled) {
      onSend(replyMessage.trim())
      setReplyMessage('')
    }
  }

  const canSend = replyMessage.trim().length > 0 && !disabled

  return (
    <View
      onLayout={(e) => {
        const {height} = e.nativeEvent.layout
        onLayout(height)
      }}
      style={[
        styles.inputContainer,
        {
          backgroundColor: isDark ? '#000000' : '#EFEFF4',
          paddingBottom: bottomPadding,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      ]}>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Type your message here"
          value={replyMessage}
          onChangeText={(text: string) => setReplyMessage(text)}
          containerStyle={styles.textInputContainer}
          style={styles.textInput}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend ? '#0B84FE' : (isDark ? '#2C2C2E' : '#E5E5EA'),
            },
          ]}>
          <Ionicons
            name="send"
            size={20}
            color={canSend ? '#FFFFFF' : (isDark ? '#8E8E93' : '#8E8E93')}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

function MessageLine({
  message,
  nextMessage,
}: {
  message: Message
  nextMessage?: Message
}) {
  const {state} = useLeagueContext()
  const userId = state.user.id
  const isUserMessage = message.from_player_id === userId
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const bubbleColor = isUserMessage
    ? '#0B84FE'
    : isDark ? '#2C2C2E' : '#E5E5EA'

  const messageStyle = [
    styles.messageContainer,
    isUserMessage ? styles.userBubble : styles.otherBubble,
    {backgroundColor: bubbleColor},
  ]

  const textStyle = isUserMessage
    ? styles.userMessageText
    : {color: isDark ? '#FFFFFF' : '#000000'}

  const timestampStyle = {
    fontSize: 11,
    color: isDark ? '#8E8E93' : '#8E8E93',
    marginTop: 4,
    paddingHorizontal: 4,
  }

  // Check if we should show the timestamp
  // Show if: no next message OR next message is more than 1 minute away
  const shouldShowTimestamp = (() => {
    if (!nextMessage) return true // Last message, always show
    
    const currentDate = DateTime.fromISO(message.created_at)
    const nextDate = DateTime.fromISO(nextMessage.created_at)
    const diffInMinutes = Math.abs(nextDate.diff(currentDate, 'minutes').minutes)
    
    return diffInMinutes >= 1
  })()

  // Format the timestamp
  const formattedTimestamp = (() => {
    if (!shouldShowTimestamp) return null
    
    const date = DateTime.fromISO(message.created_at)
    const now = DateTime.now()
    const isToday = date.hasSame(now, 'day')
    const isThisYear = date.hasSame(now, 'year')
    
    if (isToday) {
      return date.toFormat('h:mm a')
    } else if (isThisYear) {
      return date.toFormat('MMM d, h:mm a')
    } else {
      return date.toFormat('MMM d, yyyy, h:mm a')
    }
  })()

  return (
    <View style={[styles.messageWrapper, isUserMessage ? styles.userMessageWrapper : styles.otherMessageWrapper]}>
      <View style={styles.bubbleContainer}>
        <View style={messageStyle}>
          <Text style={textStyle}>{message.message}</Text>
        </View>
        <View
          style={[
            styles.tail,
            isUserMessage ? styles.tailRight : styles.tailLeft,
            isUserMessage
              ? {borderLeftColor: bubbleColor}
              : {borderRightColor: bubbleColor},
          ]}
        />
      </View>
      {formattedTimestamp && (
        <Text style={timestampStyle}>{formattedTimestamp}</Text>
      )}
    </View>
  )
}

export default function MessagesThread() {
  
  const { threadId, from } = useLocalSearchParams()
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [messages, setMessages] = useState<Message[]>([])
  const account = useAccount()

  useEffect(() => {
    navigation.setOptions({
      title: from ? `${from}` : t('messages'),
    })
  }, [navigation, t])

  const {state} = useLeagueContext()
  const userId = state.user.id
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const backgroundColor = isDark ? '#000000' : '#EFEFF4'
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [inputContainerHeight, setInputContainerHeight] = useState(0)
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const fetchMessages = async (preserveOptimistic?: Message) => {
    const res = await account.GetMessageHistory(threadId)
    if (res.status === 'ok') {
      if (preserveOptimistic) {
        // Check if the optimistic message is already in the server response
        const optimisticInResponse = res.data.some(
          (msg: Message) =>
            msg.message === preserveOptimistic.message &&
            msg.from_player_id === preserveOptimistic.from_player_id &&
            Math.abs(
              DateTime.fromISO(msg.created_at).diff(
                DateTime.fromISO(preserveOptimistic.created_at),
                'seconds',
              ).seconds,
            ) < 5, // Within 5 seconds
        )
        
        if (!optimisticInResponse) {
          // Keep the optimistic message if it's not in the server response yet
          setMessages([...res.data, preserveOptimistic])
          return
        }
      }
      setMessages(res.data)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [threadId])

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || sending || !userId) return

    // Determine recipient ID from messages
    const recipientId = messages.length > 0
      ? messages[0].from_player_id === userId
        ? messages[0].to_player_id
        : messages[0].from_player_id
      : null

    if (!recipientId) return

    // Get root_id from existing messages
    let rootId = 0
    if (messages.length > 0) {
      rootId = messages[0].root_id || messages[0].id
    } else {
      const threadIdNum = Array.isArray(threadId) 
        ? parseInt(threadId[0] || '0', 10)
        : typeof threadId === 'string'
        ? parseInt(threadId, 10)
        : threadId || 0
      rootId = isNaN(threadIdNum) ? 0 : threadIdNum
    }

    try {
      setSending(true)
      const res = await account.SendMessage(
        userId,
        recipientId,
        '', // No title for replies
        messageText.trim(),
        rootId as any,
      )

      Keyboard.dismiss()

      if (res.status === 'ok') {
        const optimisticMessage: Message = {
          id: -Date.now(), // Temporary negative ID
          title: '',
          message: messageText.trim(),
          created_at: new Date().toISOString(),
          read_at: '',
          sender_nickname: state.user.nickname || '',
          from_player_id: userId,
          to_player_id: recipientId,
          root_id: rootId,
          reply_to: 0,
        }
        setMessages((prev) => [optimisticMessage, ...prev])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (Platform.OS === 'android') {
      const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
        // Calculate total padding needed: keyboard height + (input container height / 2)
        setKeyboardHeight(e.endCoordinates.height + inputContainerHeight / 2)
      })
      const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardHeight(0)
      })

      return () => {
        showSubscription.remove()
        hideSubscription.remove()
      }
    }
  }, [inputContainerHeight])

  useEffect(() => {
    if (messages.length > 0) {
      console.log('scroll to end')
      flatListRef.current?.scrollToEnd({animated: true})
    }
  }, [messages])

  console.log('num message', messages.length)
  const content = (
    <View style={[styles.contentContainer, Platform.OS === 'android' && keyboardHeight > 0 && {paddingBottom: keyboardHeight}]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({item, index}) => (
          <MessageLine
            key={item.id}
            message={item}
            nextMessage={messages[index + 1]}
          />
        )}
        inverted={true}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 100,
        }}
        style={[styles.list, {backgroundColor}]}
        contentContainerStyle={[
          styles.listContent,
          {backgroundColor},
          messages.length === 0 && styles.emptyListContent,
        ]}
        keyboardShouldPersistTaps="handled"
      />
      <ResponseInput
        keyboardHeight={keyboardHeight}
        onLayout={setInputContainerHeight}
        onSend={handleSendMessage}
        disabled={sending}
      />
    </View>
  )

  return (
    <ThemedView
      lightColor="#EFEFF4"
      darkColor="#000000"
      style={styles.container}>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior="padding"
          keyboardVerticalOffset={90}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.keyboardAvoidingView}>
          {content}
        </View>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  inputContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  textInputContainer: {
    marginBottom: 0,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageWrapper: {
    marginVertical: 4,
    marginHorizontal: 24,
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubbleContainer: {
    position: 'relative',
  },
  messageContainer: {
    padding: 12,
  },
  userBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 0,
  },
  otherBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 18,
  },
  tail: {
    width: 0,
    height: 0,
    position: 'absolute',
    bottom: 0,
  },
  tailRight: {
    right: -7,
    borderTopWidth: 0,
    borderBottomWidth: 7,
    borderRightWidth: 0,
    borderLeftWidth: 7,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tailLeft: {
    left: -7,
    borderTopWidth: 0,
    borderBottomWidth: 7,
    borderRightWidth: 7,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
})