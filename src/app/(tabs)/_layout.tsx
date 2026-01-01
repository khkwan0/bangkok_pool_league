import LanguageOption from '@/components/LanguageOption'
import { TabBarIcon } from '@/components/navigation/TabBarIcon'
import { useLeagueContext } from '@/context/LeagueContext'
import { useAccount } from '@/hooks/useAccount'
import i18n from '@/i18n'
import notifee from '@notifee/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { getMessaging, onMessage } from '@react-native-firebase/messaging'
import { Tabs } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'

export default function TabLayout() {
  const {t} = useTranslation()
  const {state, dispatch} = useLeagueContext()
  const account = useAccount()
  const [isMounted, setIsMounted] = React.useState(false)
  const [showLanguageOption, setShowLanguageOption] = React.useState(false)
  const hasFetchedThreads = React.useRef(false)

  // Create messages tab options function that will be re-evaluated
  // Using useMemo ensures the function reference changes when messageCount changes
  const messagesTabOptions = React.useMemo(
    () => ({
      title: t('messages'),
      headerShown: false,
      tabBarIcon: ({color, focused}: {color: string; focused: boolean}) => (
        <TabBarIcon
          name={focused ? 'mail' : 'mail-outline'}
          color={color}
        />
      ),
      tabBarLabel: t('messages'),
      tabBarBadge: state.messageCount > 0 ? String(state.messageCount) : undefined,
      tabBarBadgeStyle: state.messageCount > 0 ? {backgroundColor: '#ef4444'} : undefined,
    }),
    [t, state.messageCount]
  )

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
      // Only fetch if user is logged in and we haven't fetched yet
      if (state.user?.id && !hasFetchedThreads.current && state.messageThreads.length === 0) {
        try {
          const res = await account.GetMessageThreads()
          if (res.status === 'ok' && Array.isArray(res.data)) {
            dispatch({ type: 'SET_MESSAGE_THREADS', payload: res.data })
            hasFetchedThreads.current = true
          }
        } catch (e) {
          console.error('Error fetching initial threads:', e)
        }
      }
    }
    
    // Only fetch after component is mounted and user might be loaded
    if (isMounted) {
      fetchInitialThreads()
    }
  }, [isMounted, state.user?.id, state.messageThreads.length])

  // Update app icon badge whenever messageCount changes (works for both iOS and Android)
  // On Android, be aggressive: update immediately with state.messageCount, then fetch from API
  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(state.messageCount)
    } else if (Platform.OS === 'android' && isMounted && notifee && typeof notifee.setBadgeCount === 'function') {
      // Ensure notifee is ready before setting badge count
      const updateBadge = async () => {
        try {
          // Validate count is a valid number
          const count = Math.max(0, Math.floor(state.messageCount || 0))
          
          // Set badge count - this may fail silently on launchers that don't support badges
          await notifee.setBadgeCount(count)
          console.log('Android app icon badge updated immediately to:', count)
        } catch (e: any) {
          // Log detailed error information
          console.error('Error setting Android badge count (immediate):', {
            error: e,
            message: e?.message || 'Unknown error',
            code: e?.code,
            stack: e?.stack,
            count: state.messageCount
          })
          // Note: Some Android launchers don't support badges, so this is expected to fail on some devices
        }
      }
      
      // Small delay to ensure notifee is fully initialized
      const timeoutId = setTimeout(() => {
        updateBadge()
      }, 100)
      
      // Then fetch from API to ensure accuracy (but don't wait for it)
      account.GetUnreadMessageCount()
        .then(async (unreadCount) => {
          if (typeof unreadCount === 'number' && unreadCount !== state.messageCount) {
            try {
              const count = Math.max(0, Math.floor(unreadCount))
              await notifee.setBadgeCount(count)
              console.log('Android app icon badge updated from API to:', count)
            } catch (e: any) {
              console.error('Error setting Android badge count from API:', {
                error: e,
                message: e?.message || 'Unknown error',
                code: e?.code,
                stack: e?.stack,
                count: unreadCount
              })
            }
          }
        })
        .catch((e) => {
          console.error('Error fetching unread count for app icon badge:', e)
        })
      
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [state.messageCount, account, isMounted])

  // Listen for notifications and refresh threads to update badge
  React.useEffect(() => {
    if (Platform.OS !== 'web' && state.user?.id) {
      const messaging = getMessaging()
      const unsubscribe = onMessage(messaging, async remoteMessage => {
        console.log('Notification received in foreground:', remoteMessage?.data)
        // When a notification arrives, update badge immediately for Android
        try {
          // For Android, force badge update by fetching unread count from API immediately
          if (Platform.OS === 'android' && notifee && typeof notifee.setBadgeCount === 'function') {
            try {
              const unreadCount = await account.GetUnreadMessageCount()
              if (typeof unreadCount === 'number') {
                // Update badge immediately
                try {
                  const count = Math.max(0, Math.floor(unreadCount))
                  await notifee.setBadgeCount(count)
                  console.log('Android badge updated from API (foreground) to:', count)
                } catch (badgeError: any) {
                  console.error('Error setting Android badge count (foreground):', {
                    error: badgeError,
                    message: badgeError?.message || 'Unknown error',
                    code: badgeError?.code,
                    stack: badgeError?.stack,
                    count: unreadCount
                  })
                }
                // Update context state
                dispatch({ type: 'SET_MESSAGE_COUNT', payload: unreadCount })
              }
            } catch (e) {
              console.error('Error fetching unread count for Android badge:', e)
            }
          }
          
          // Refresh threads to update context (this will also update badge via useEffect)
          const res = await account.GetMessageThreads()
          if (res.status === 'ok' && Array.isArray(res.data)) {
            dispatch({ type: 'SET_MESSAGE_THREADS', payload: res.data })
          }
        } catch (e) {
          console.error('Error refreshing threads on notification:', e)
        }
      })
      return unsubscribe
    }
  }, [state.user?.id, account, dispatch])

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
  } else {
    return (
      <Tabs>
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
            title: t('teams'),
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabBarIcon
                name={focused ? 'people' : 'people-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          key={`messages-${state.messageCount}`}
          options={messagesTabOptions}
        />
      </Tabs>
    )
  }
}
