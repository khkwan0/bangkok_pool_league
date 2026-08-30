import AnnouncementDialog from '@/components/Announcements/AnnouncementDialog'
import LanguageOption from '@/components/LanguageOption'
import {CustomTabBar} from '@/components/navigation/CustomTabBar'
import {TabBarIcon} from '@/components/navigation/TabBarIcon'
import {useLeagueContext} from '@/context/LeagueContext'
import {useAccount} from '@/hooks/useAccount'
import {useAnnouncements} from '@/hooks/useAnnouncements'
import i18n from '@/i18n'
import {
  refreshAnnouncementUnread,
  setHasUnreadAnnouncements,
} from '@/lib/announcementUnread'
import {
  applyBadgeFromRemoteMessage,
  getBadgeFromRemoteMessage,
  presentRemoteNotification,
  setAppBadgeCount,
} from '@/lib/notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  getMessaging,
  onMessage,
  onTokenRefresh,
} from '@react-native-firebase/messaging'
import {Tabs} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {AppState, Platform, View} from 'react-native'

export default function TabLayout() {
  const {t} = useTranslation()
  const {state, dispatch} = useLeagueContext()
  const account = useAccount()
  const {getUnread, markRead, hasUnread} = useAnnouncements()
  const [isMounted, setIsMounted] = React.useState(false)
  const [showLanguageOption, setShowLanguageOption] = React.useState(false)
  const [unreadAnnouncement, setUnreadAnnouncement] = React.useState<{
    id: number
    title: string
    content: string
    created_at: string
    modified_at: string
  } | null>(null)
  const [showAnnouncementDialog, setShowAnnouncementDialog] = React.useState(false)
  const [markingAnnouncementRead, setMarkingAnnouncementRead] = React.useState(false)
  const hasFetchedThreads = React.useRef(false)
  const accountRef = React.useRef(account)
  const dispatchRef = React.useRef(dispatch)
  const announcementsRef = React.useRef({getUnread, markRead, hasUnread})

  React.useEffect(() => {
    accountRef.current = account
    dispatchRef.current = dispatch
    announcementsRef.current = {getUnread, markRead, hasUnread}
  }, [account, dispatch, getUnread, markRead, hasUnread])

  const checkUnreadAnnouncements = React.useCallback(async () => {
    if (!state.user?.id) {
      setUnreadAnnouncement(null)
      setShowAnnouncementDialog(false)
      setHasUnreadAnnouncements(false)
      return
    }
    try {
      const announcement = await announcementsRef.current.getUnread()
      await refreshAnnouncementUnread(announcementsRef.current.hasUnread)
      if (announcement) {
        setUnreadAnnouncement(announcement)
        setShowAnnouncementDialog(true)
      } else {
        setUnreadAnnouncement(null)
        setShowAnnouncementDialog(false)
      }
    } catch (e) {
      console.error('Error checking unread announcements:', e)
    }
  }, [state.user?.id])

  async function handleAnnouncementDismiss() {
    if (!unreadAnnouncement || markingAnnouncementRead) {
      return
    }
    setMarkingAnnouncementRead(true)
    try {
      await announcementsRef.current.markRead(unreadAnnouncement.id)
      setShowAnnouncementDialog(false)
      setUnreadAnnouncement(null)
      setHasUnreadAnnouncements(false)
      await refreshAnnouncementUnread(announcementsRef.current.hasUnread)
    } catch (e) {
      console.error('Error marking announcement read:', e)
    } finally {
      setMarkingAnnouncementRead(false)
    }
  }

  const syncUnreadFromServer = React.useCallback(async () => {
    try {
      const unreadCount = await accountRef.current.GetUnreadMessageCount()
      if (typeof unreadCount === 'number') {
        dispatchRef.current({type: 'SET_MESSAGE_COUNT', payload: unreadCount})
        await setAppBadgeCount(unreadCount)
      }

      const res = await accountRef.current.GetMessageThreads()
      if (res.status === 'ok' && Array.isArray(res.data)) {
        dispatchRef.current({type: 'SET_MESSAGE_THREADS', payload: res.data})
      }
    } catch (e) {
      console.error('Error syncing unread messages:', e)
    }
  }, [])

  React.useEffect(() => {
    async function getLanguage() {
      try {
        const lang = await AsyncStorage.getItem('language')
        if (!lang) {
          setShowLanguageOption(true)
        } else {
          await i18n.changeLanguage(lang)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setIsMounted(true)
      }
    }
    getLanguage()
  }, [])

  // Fetch message threads on app startup if user is logged in
  React.useEffect(() => {
    async function fetchInitialThreads() {
      if (
        state.user?.id &&
        !hasFetchedThreads.current &&
        state.messageThreads.length === 0
      ) {
        try {
          await syncUnreadFromServer()
          hasFetchedThreads.current = true
        } catch (e) {
          console.error('Error fetching initial threads:', e)
        }
      }
    }

    if (isMounted) {
      fetchInitialThreads()
    }
  }, [
    isMounted,
    state.user?.id,
    state.messageThreads.length,
    syncUnreadFromServer,
  ])

  // Check for unread announcements when user is logged in
  React.useEffect(() => {
    if (!isMounted || !state.user?.id) {
      return
    }
    checkUnreadAnnouncements()
  }, [isMounted, state.user?.id, checkUnreadAnnouncements])

  // Keep app icon badge in sync with in-app unread count
  React.useEffect(() => {
    if (!isMounted || Platform.OS === 'web') {
      return
    }
    setAppBadgeCount(state.messageCount)
  }, [state.messageCount, isMounted])

  // Refresh unread count whenever the app returns to foreground
  React.useEffect(() => {
    if (!state.user?.id) {
      return
    }

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncUnreadFromServer()
        checkUnreadAnnouncements()
      }
    })

    return () => subscription.remove()
  }, [state.user?.id, syncUnreadFromServer, checkUnreadAnnouncements])

  // Keep FCM token fresh and listen for foreground pushes (stable listener)
  React.useEffect(() => {
    if (Platform.OS === 'web' || !state.user?.id) {
      return
    }

    const messaging = getMessaging()

    const unsubscribeToken = onTokenRefresh(messaging, async () => {
      try {
        await accountRef.current.RefreshPushToken()
      } catch (e) {
        console.error('Error refreshing FCM token:', e)
      }
    })

    // Force-register current token on mount
    accountRef.current.RefreshPushToken().catch((e: unknown) => {
      console.error('Error ensuring FCM token:', e)
    })

    const unsubscribeMessage = onMessage(messaging, async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage?.data)
      try {
        await presentRemoteNotification(remoteMessage)

        // Optimistic UI update from payload badge so the tab updates immediately
        const payloadBadge = getBadgeFromRemoteMessage(remoteMessage)
        if (payloadBadge != null) {
          dispatchRef.current({type: 'SET_MESSAGE_COUNT', payload: payloadBadge})
          await setAppBadgeCount(payloadBadge)
        } else {
          await applyBadgeFromRemoteMessage(remoteMessage)
        }

        await syncUnreadFromServer()
      } catch (e) {
        console.error('Error handling foreground notification:', e)
      }
    })

    return () => {
      unsubscribeMessage()
      unsubscribeToken()
    }
  }, [state.user?.id, syncUnreadFromServer])

  async function handleLanguageOption(lang: string) {
    try {
      await AsyncStorage.setItem('language', lang)
      await i18n.changeLanguage(lang)
      setShowLanguageOption(false)
    } catch (error) {
      console.log(error)
    }
  }

  if (!isMounted) {
    return null
  }
  if (showLanguageOption) {
    return (
      <View className="flex-1 justify-center mx-4">
        <LanguageOption handleLanguageOption={handleLanguageOption} />
      </View>
    )
  }

  return (
    <>
      <AnnouncementDialog
        announcement={unreadAnnouncement}
        visible={showAnnouncementDialog}
        submitting={markingAnnouncementRead}
        onDismiss={handleAnnouncementDismiss}
      />
      <Tabs tabBar={props => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="(index)"
        options={{
          headerTitle: t('bangkok_pool_league'),
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
            />
          ),
          tabBarLabel: t('home'),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: t('statistics'),
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: t('completed'),
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'code-slash' : 'code-slash-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('messages'),
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'mail' : 'mail-outline'}
              color={color}
            />
          ),
          tabBarLabel: t('messages'),
        }}
      />
    </Tabs>
    </>
  )
}
