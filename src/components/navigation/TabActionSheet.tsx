import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {Colors} from '@/constants/Colors'
import config from '@/config.js'
import {useLeagueContext} from '@/context/LeagueContext'
import {useHasNewForumPosts} from '@/lib/forumActivity'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {
  BottomSheetModal,
  BottomSheetView,
} from '@expo/ui/community/bottom-sheet'
import {useRouter} from 'expo-router'
import React from 'react'
import {Pressable, Text as RNText, useColorScheme, View as RNView} from 'react-native'
import {useTranslation} from 'react-i18next'

type QuickActionItemProps = {
  icon: React.ComponentProps<typeof MCI>['name']
  label: string
  iconColor: string
  iconBackground: string
  onPress: () => void
  showBadge?: boolean
  badgeLabel?: string
}

function QuickActionItem({
  icon,
  label,
  iconColor,
  iconBackground,
  onPress,
  showBadge,
  badgeLabel,
}: QuickActionItemProps) {
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]

  return (
    <Pressable
      className="my-2 flex-row items-center rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-700"
      accessibilityHint={showBadge ? badgeLabel : undefined}
      onPress={onPress}>
      <RNView className="relative mr-4">
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{backgroundColor: iconBackground}}>
          <MCI name={icon} color={iconColor} size={24} />
        </View>
        {showBadge ? (
          <RNView
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-red-500"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        ) : null}
      </RNView>
      <Text className="flex-1 font-bold">{label}</Text>
      {showBadge && badgeLabel ? (
        <RNView className="mr-2 rounded-full bg-red-500 px-2 py-0.5">
          <RNText className="text-xs font-bold text-white">{badgeLabel}</RNText>
        </RNView>
      ) : null}
      <MCI name="chevron-right" color={colors.icon} size={22} />
    </Pressable>
  )
}

export const TabActionSheet = React.forwardRef<BottomSheetModal>(
  function TabActionSheet(_props, ref) {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]
    const router = useRouter()
    const {t} = useTranslation()
    const {state} = useLeagueContext()
    const user = state.user
    const hasNewForumPosts = useHasNewForumPosts()
    const snapPoints = React.useMemo(() => ['55%'], [])

    const navigate = (url: string) => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss()
      }
      router.push(url as any)
    }

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{backgroundColor: colors.background}}>
        <BottomSheetView style={{flex: 1, paddingHorizontal: 20, paddingBottom: 24}}>
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <Text type="subtitle">Quick Actions</Text>
              <Text className="text-sm opacity-60">
                Build {config.build}
              </Text>
            </View>
            <Text className="mt-1 text-sm opacity-60">
              {t('player_id')}:{' '}
              {typeof user?.id !== 'undefined' && user.id
                ? String(user.id)
                : '—'}
            </Text>
          </View>
          <QuickActionItem
            icon="forum-outline"
            label={t('forums')}
            iconColor="#2196F3"
            iconBackground="rgba(33, 150, 243, 0.15)"
            showBadge={hasNewForumPosts}
            badgeLabel={t('forums_new_posts')}
            onPress={() => navigate('/Settings/Forums')}
          />
          <QuickActionItem
            icon="cog"
            label={t('settings')}
            iconColor={colors.tint}
            iconBackground={
              colorScheme === 'dark'
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(10, 126, 164, 0.12)'
            }
            onPress={() => navigate('/Settings')}
          />
          <QuickActionItem
            icon="robot-outline"
            label={t('ai_assistant')}
            iconColor="#9C27B0"
            iconBackground="rgba(156, 39, 176, 0.15)"
            onPress={() => navigate('/Settings/CueChat')}
          />
          <QuickActionItem
            icon="account-group"
            label={t('teams')}
            iconColor="#4CAF50"
            iconBackground="rgba(76, 175, 80, 0.15)"
            onPress={() => navigate('/teams')}
          />
          <QuickActionItem
            icon="information-outline"
            label={t('info_and_guides')}
            iconColor="#FF9800"
            iconBackground="rgba(255, 152, 0, 0.15)"
            onPress={() => navigate('/Settings/Info')}
          />
        </BottomSheetView>
      </BottomSheetModal>
    )
  },
)
