/* eslint-disable react-hooks/exhaustive-deps */
import Messages from '@/components/Messages'
import { Thread } from '@/components/Messages/types'
import { useLeagueContext } from '@/context/LeagueContext'
import { useAccount } from '@/hooks/useAccount'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import notifee from '@notifee/react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'

export default function MessagesScreen() {
  const account = useAccount()
  const { state, dispatch } = useLeagueContext()
  const [threads, setThreads] = React.useState<Thread[]>(state.messageThreads || [])
  const [loading, setLoading] = React.useState(state.messageThreads.length === 0)
  const { t } = useTranslation()
  const navigation = useNavigation()
  const accountRef = React.useRef(account)
  const dispatchRef = React.useRef(dispatch)
  const hasFetchedRef = React.useRef(false)

  // Keep refs updated
  React.useEffect(() => {
    accountRef.current = account
    dispatchRef.current = dispatch
  }, [account, dispatch])

  // Update local threads when context threads change
  React.useEffect(() => {
    if (state.messageThreads.length > 0) {
      setThreads(state.messageThreads)
      setLoading(false)
    }
  }, [state.messageThreads])

  React.useEffect(() => {
    navigation.setOptions({
      title: t('messages'),
    })
  }, [navigation, t])

  // Update badge whenever messageCount changes
  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(state.messageCount)
    } else if (Platform.OS === 'android') {
      notifee.setBadgeCount(state.messageCount).catch((e) => {
        console.error('Error setting Android badge count:', e)
      })
    }
  }, [state.messageCount])

  // Initial fetch on mount if no cached data
  React.useEffect(() => {
    if (state.messageThreads.length === 0 && !hasFetchedRef.current) {
      const fetchInitialData = async () => {
        try {
          setLoading(true)
          const res = await account.GetMessageThreads()
          if (res.status === 'ok' && Array.isArray(res.data)) {
            setThreads(res.data)
            dispatch({ type: 'SET_MESSAGE_THREADS', payload: res.data })
            hasFetchedRef.current = true
          }
        } catch (e) {
          console.error('fetchThreads', e)
        } finally {
          setLoading(false)
        }
      }
      fetchInitialData()
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      // Refresh threads in background when screen comes into focus
      // but only if we already have cached data (to avoid flicker)
      if (state.messageThreads.length > 0) {
        const refreshData = async () => {
          try {
            const res = await accountRef.current.GetMessageThreads()
            if (res.status === 'ok' && Array.isArray(res.data)) {
              setThreads(res.data)
              dispatchRef.current({ type: 'SET_MESSAGE_THREADS', payload: res.data })
            }
          } catch (e) {
            console.error('refreshThreads', e)
          }
        }
        refreshData()
      }
    }, [state.messageThreads.length])
  )

  const handleThreadPress = (thread: Thread) => {
    const threadId = thread.other_player_id
    const from = thread.participant_name || thread.participant_nickname || thread.from || thread.sender_nickname || ''
    
    if (threadId) {
      router.push({
        pathname: `/messages/${threadId}` as any,
        params: { from }
      })
    }
  }

  return <Messages threads={threads} loading={loading} onThreadPress={handleThreadPress} />
}
