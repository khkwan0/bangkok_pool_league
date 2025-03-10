/* eslint-disable react-hooks/exhaustive-deps */
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useAccount} from '@/hooks/useAccount'
import {useLeagueContext} from '@/context/LeagueContext'
import React from 'react'
import {FlatList, ActivityIndicator} from 'react-native'
import MessageCard from './MessageCard'
import Button from '@/components/Button'
import {useTranslation} from 'react-i18next'
import {useNavigation} from '@react-navigation/native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import PushNotification from '@react-native-community/push-notification-ios'
import {Message} from './types'
import {DateTime} from 'luxon'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function Messages() {
  const account = useAccount()
  const {state, dispatch} = useLeagueContext()
  const userId = state.user.id
  const [messages, setMessages] = React.useState<Message[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showAll, setShowAll] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const {t} = useTranslation()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  React.useEffect(() => {
    navigation.setOptions({
      title: t('messages'),
    })
  }, [navigation, t])

  React.useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (userId) {
          setLoading(true)
          const res = await account.GetMessages(userId)
          if (res.status === 'ok') {
            setMessages(res.data)
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [userId])

  React.useEffect(() => {
    const unreadCount = messages.filter(
      (message: Message) => message.read_at === null,
    ).length
    setUnreadCount(unreadCount)
  }, [messages])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  async function HandleMarkAllRead() {
    try {
      const res = await account.MarkAllMessagesAsRead()
      if (res.status === 'ok') {
        setMessages(res.data)
        PushNotification.setApplicationIconBadgeNumber(0)
        dispatch({type: 'SET_MESSAGE_COUNT', payload: 0})
        const _messages = messages.map((message: Message) => {
          if (message.read_at === null) {
            message.read_at = DateTime.now().toFormat('LLL d, yyyy')
          }
          return message
        })
        setMessages(_messages)
      }
    } catch (e) {
      console.error(e)
    }
  }

  function HandleToggleShowAll() {
    setShowAll(!showAll)
  }

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 10}}>
        <FlatList
          data={messages}
          renderItem={({item}) => (
            <MessageCard message={item} showAll={showAll} />
          )}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View className="flex-row items-center justify-end px-4 py-3">
              <Button onPress={HandleToggleShowAll} style={{padding: 8}}>
                <Ionicons
                  name={showAll ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={'#ecedee'}
                />
              </Button>
            </View>
          }
          ListEmptyComponent={
            <View className="py-8 justify-center items-center">
              <Text className="opacity-60">{t('no_messages')}</Text>
            </View>
          }
        />
      </View>
      {unreadCount > 0 && !showAll && (
        <View
          style={{flex: 1, paddingBottom: insets.bottom}}
          className="items-center justify-center">
          <Button onPress={() => HandleMarkAllRead()}>
            {t('mark_all_read')}
          </Button>
        </View>
      )}
    </View>
  )
}
