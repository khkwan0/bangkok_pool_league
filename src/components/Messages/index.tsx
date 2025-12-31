/* eslint-disable react-hooks/exhaustive-deps */
import { ThemedText as Text } from '@/components/ThemedText'
import { ThemedView as View } from '@/components/ThemedView'
import config from '@/config'
import { useLeagueContext } from '@/context/LeagueContext'
import { useAccount } from '@/hooks/useAccount'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { DateTime } from 'luxon'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native'

interface Thread {
  id?: number
  thread_id?: number
  root_id?: number
  title?: string
  last_message?: string
  last_message_preview?: string
  last_message_at?: string
  created_at?: string
  unread_count?: number
  participant_name?: string
  participant_nickname?: string
  from?: string
  sender_nickname?: string
  other_player_id?: number
  other_player_nickname?: string
  other_player_firstname?: string
  other_player_lastname?: string
  other_player_profile_picture?: string
}

export default function Messages() {
  const account = useAccount()
  const {state, dispatch} = useLeagueContext()
  const [threads, setThreads] = React.useState<Thread[]>([])
  const [loading, setLoading] = React.useState(true)
  const {t} = useTranslation()
  const navigation = useNavigation()

  React.useEffect(() => {
    navigation.setOptions({
      title: t('messages'),
    })
  }, [navigation, t])

  React.useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true)
        const res = await account.GetMessageThreads()
        if (res.status === 'ok' && Array.isArray(res.data)) {
          setThreads(res.data)
        }
      } catch (e) {
        console.error('fetchThreads', e)
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [])

  const handleThreadPress = (thread: Thread) => {
    const threadId = thread.other_player_id
    const from = thread.participant_name || thread.participant_nickname || thread.from || thread.sender_nickname || ''
    
    if (threadId) {
      router.push({
        pathname: `/Settings/Messages/${threadId}` as any,
        params: {from}
      })
    }
  }

  const renderThreadItem = ({item}: {item: Thread}) => {
    const threadId = item.id || item.thread_id || item.root_id
    const displayName = item.other_player_nickname || t('unknown')
    const profilePicture = item.other_player_profile_picture
    const lastMessagePreview = item.last_message_preview || item.last_message || item.title || ''
    const lastMessageDate = item.last_message_at || item.created_at
    const unreadCount = item.unread_count || 0
    
    let dateText = ''
    if (lastMessageDate) {
      // Parse as UTC and convert to local timezone
      const date = DateTime.fromISO(lastMessageDate, {zone: 'utc'}).toLocal()
      const now = DateTime.now()
      if (date.hasSame(now, 'day')) {
        dateText = date.toFormat('h:mm a')
      } else if (date.hasSame(now.minus({days: 1}), 'day')) {
        dateText = t('yesterday')
      } else {
        dateText = date.toFormat('LLL d')
      }
    }

    return (
      <TouchableOpacity
        onPress={() => handleThreadPress(item)}
        className="px-4 py-3 border-b border-white/10"
        activeOpacity={0.7}>
        <View className="relative">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1 mr-2">
              {profilePicture ? (
                <Image
                  source={{uri: config.profileUrl + profilePicture}}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <View className="w-10 h-10 rounded-full mr-3 bg-white/10 justify-center items-center">
                  <Ionicons name="person" size={20} color="#8E8E93" />
                </View>
              )}
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-bold" numberOfLines={1}>
                    {displayName}
                  </Text>
                  {unreadCount > 0 && (
                    <View 
                      className="ml-2 rounded-full min-w-[20px] h-5 px-1.5 justify-center items-center"
                      style={{backgroundColor: '#ef4444'}}>
                      <Text className="text-white text-xs font-semibold">{String(unreadCount)}</Text>
                    </View>
                  )}
                </View>
                {lastMessagePreview ? (
                  <Text className="text-sm opacity-70 mt-0.5" numberOfLines={1}>
                    {lastMessagePreview}
                  </Text>
                ) : null}
              </View>
            </View>
            {dateText ? (
              <Text className="text-sm opacity-60 ml-2">{dateText}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1">
      <FlatList
        data={threads}
        renderItem={renderThreadItem}
        keyExtractor={(item, index) => {
          const threadId = item.id || item.thread_id || item.root_id
          return threadId ? String(threadId) : `thread-${index}`
        }}
        ListEmptyComponent={
          <View className="py-8 justify-center items-center">
            <Text className="opacity-60">{t('no_messages')}</Text>
          </View>
        }
      />
    </View>
  )
}
