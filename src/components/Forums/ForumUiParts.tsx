import {getForumAccent} from '@/components/Forums/forumUi'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import React from 'react'
import {useColorScheme} from 'react-native'

type ForumStatChipProps = {
  icon: React.ComponentProps<typeof MCI>['name']
  label: string
  fg: string
  bg: string
}

export function ForumStatChip({icon, label, fg, bg}: ForumStatChipProps) {
  return (
    <View
      className="flex-row items-center rounded-full px-2.5 py-1"
      style={{backgroundColor: bg}}>
      <MCI name={icon} size={12} color={fg} style={{marginRight: 4}} />
      <Text className="text-xs font-semibold" style={{color: fg}}>
        {label}
      </Text>
    </View>
  )
}

type ForumIconBadgeProps = {
  icon: React.ComponentProps<typeof MCI>['name']
  fg: string
  bg: string
  size?: number
}

export function ForumIconBadge({
  icon,
  fg,
  bg,
  size = 44,
}: ForumIconBadgeProps) {
  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
      }}>
      <MCI name={icon} size={size * 0.5} color={fg} />
    </View>
  )
}

type ForumsHeroProps = {
  title: string
  subtitle: string
}

export function ForumsHero({title, subtitle}: ForumsHeroProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View
      className="mx-4 mb-2 mt-3 overflow-hidden rounded-2xl px-4 py-4"
      style={{
        backgroundColor: isDark ? 'rgba(33, 150, 243, 0.22)' : '#E3F2FD',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(33, 150, 243, 0.35)' : 'rgba(33, 150, 243, 0.25)',
      }}>
      <View className="flex-row items-center">
        <ForumIconBadge
          icon="forum-outline"
          fg="#1565C0"
          bg={isDark ? 'rgba(21, 101, 192, 0.35)' : 'rgba(21, 101, 192, 0.12)'}
          size={48}
        />
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold" style={{color: isDark ? '#90CAF9' : '#1565C0'}}>
            {title}
          </Text>
          <Text
            className="mt-0.5 text-sm"
            style={{color: isDark ? 'rgba(144, 202, 249, 0.85)' : '#1976D2'}}>
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  )
}

type ForumSectionHeaderProps = {
  title: string
  description: string | null
  accentIndex: number
}

export function ForumSectionHeader({
  title,
  description,
  accentIndex,
}: ForumSectionHeaderProps) {
  const accent = getForumAccent(accentIndex)

  return (
    <View className="mb-3 mt-5 px-4">
      <View className="flex-row items-center">
        <ForumIconBadge
          icon="shape-outline"
          fg={accent.fg}
          bg={accent.bg}
          size={36}
        />
        <View className="ml-3 flex-1">
          <Text className="text-base font-bold" style={{color: accent.fg}}>
            {title}
          </Text>
          {description ? (
            <Text className="mt-0.5 text-sm opacity-70">{description}</Text>
          ) : null}
        </View>
      </View>
      <View
        className="mt-3 h-1 rounded-full"
        style={{backgroundColor: accent.border}}
      />
    </View>
  )
}
