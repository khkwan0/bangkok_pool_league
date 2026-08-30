import Button from '@/components/Button'
import {ChatMarkdown} from '@/components/ChatMarkdown'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeagueContext} from '@/context/LeagueContext'
import {resolveAnnouncementContent} from '@/lib/announcementContent'
import type {Announcement} from '@/types/announcements'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  useColorScheme,
} from 'react-native'

type AnnouncementDialogProps = {
  announcement: Announcement | null
  visible: boolean
  submitting: boolean
  onDismiss: () => void
}

export default function AnnouncementDialog({
  announcement,
  visible,
  submitting,
  onDismiss,
}: AnnouncementDialogProps) {
  const {t} = useTranslation()
  const {apiUrl} = useLeagueContext()
  const colorScheme = useColorScheme()
  const textColor = colorScheme === 'dark' ? '#e5e7eb' : '#111827'

  const content = React.useMemo(() => {
    if (!announcement?.content || !apiUrl) {
      return announcement?.content ?? ''
    }
    return resolveAnnouncementContent(announcement.content, apiUrl)
  }, [announcement?.content, apiUrl])

  if (!announcement) {
    return null
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 justify-center bg-black/60 px-4 py-8"
        onPress={() => {
          if (!submitting) {
            onDismiss()
          }
        }}>
        <Pressable onPress={e => e.stopPropagation()}>
          <View className="max-h-[85%] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <ScrollView
              className="px-5 pt-5"
              contentContainerStyle={{paddingBottom: 16}}>
              <Text type="subtitle" className="mb-2">
                {announcement.title}
              </Text>
              <ChatMarkdown content={content} textColor={textColor} />
            </ScrollView>
            <View className="border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              {submitting ? (
                <View className="flex-row items-center justify-center gap-2 py-2">
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text className="text-slate-600 dark:text-slate-300">
                    {t('submitting')}
                  </Text>
                </View>
              ) : (
                <Button onPress={onDismiss}>{t('announcements_got_it')}</Button>
              )}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
