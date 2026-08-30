import {ChatMarkdown} from '@/components/ChatMarkdown'
import {formatForumDate} from '@/components/Forums/formatForumDate'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useAnnouncements} from '@/hooks/useAnnouncements'
import {useLeagueContext} from '@/context/LeagueContext'
import {resolveAnnouncementContent} from '@/lib/announcementContent'
import {
  refreshAnnouncementUnread,
  setHasUnreadAnnouncements,
} from '@/lib/announcementUnread'
import type {Announcement} from '@/types/announcements'
import {useLocalSearchParams, useNavigation} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {ActivityIndicator, ScrollView, useColorScheme} from 'react-native'

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export default function AnnouncementDetailScreen() {
  const {t, i18n} = useTranslation()
  const navigation = useNavigation()
  const params = useLocalSearchParams<{id: string}>()
  const id = parseInt(firstParam(params.id) ?? '', 10)
  const {getAnnouncement, markRead, hasUnread} = useAnnouncements()
  const {apiUrl} = useLeagueContext()
  const colorScheme = useColorScheme()
  const textColor = colorScheme === 'dark' ? '#e5e7eb' : '#111827'
  const [announcement, setAnnouncement] = React.useState<Announcement | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const data = await getAnnouncement(id)
        setAnnouncement(data)
        navigation.setOptions({title: data?.title ?? t('announcement')})
        if (data && !data.read_at) {
          await markRead(id)
          setHasUnreadAnnouncements(false)
          await refreshAnnouncementUnread(hasUnread)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [id, getAnnouncement, markRead, hasUnread, navigation, t])

  const content = React.useMemo(() => {
    if (!announcement?.content || !apiUrl) {
      return announcement?.content ?? ''
    }
    return resolveAnnouncementContent(announcement.content, apiUrl)
  }, [announcement?.content, apiUrl])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!announcement) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center opacity-60">{t('announcements_not_found')}</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 px-4 py-4">
      <Text type="subtitle" className="mb-2">
        {announcement.title}
      </Text>
      <Text className="mb-4 text-sm opacity-60">
        {formatForumDate(announcement.modified_at, i18n.language)}
      </Text>
      <ChatMarkdown content={content} textColor={textColor} />
    </ScrollView>
  )
}
