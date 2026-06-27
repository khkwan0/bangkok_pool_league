import JoinForumsModal from '@/components/Forums/JoinForumsModal'
import {formatForumDate} from '@/components/Forums/formatForumDate'
import {
  ForumIconBadge,
  ForumSectionHeader,
  ForumStatChip,
  ForumsHero,
} from '@/components/Forums/ForumUiParts'
import {FORUM_STAT_COLORS, getForumAccent} from '@/components/Forums/forumUi'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useForums} from '@/hooks/useForums'
import type {ForumBoard, ForumCategoryWithForums} from '@/types/forums'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {useNavigation, useTheme} from '@react-navigation/native'
import {useRouter} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  useColorScheme,
} from 'react-native'

type ForumSection = {
  title: string
  description: string | null
  categoryIndex: number
  data: ForumBoard[]
}

function ForumRow({
  forum,
  accentIndex,
  onPress,
}: {
  forum: ForumBoard
  accentIndex: number
  onPress: () => void
}) {
  const {t, i18n} = useTranslation()
  const {colors} = useTheme()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const accent = getForumAccent(accentIndex)

  return (
    <Pressable
      onPress={onPress}
      className="mx-4 mb-3 overflow-hidden rounded-2xl"
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: accent.border,
        shadowColor: accent.fg,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: isDark ? 0.15 : 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}>
      <View
        className="absolute bottom-0 left-0 top-0 w-1.5"
        style={{backgroundColor: accent.fg}}
      />
      <View className="flex-row items-start px-4 py-3.5 pl-5">
        <ForumIconBadge
          icon={forum.is_locked ? 'lock' : 'forum-outline'}
          fg={accent.fg}
          bg={accent.bg}
        />
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 pr-2 text-base font-bold">{forum.name}</Text>
            <MCI name="chevron-right" size={22} color={accent.fg} />
          </View>
          {forum.description ? (
            <Text className="mt-1 text-sm opacity-70" numberOfLines={2}>
              {forum.description}
            </Text>
          ) : null}
          <View className="mt-3 flex-row flex-wrap gap-2">
            <ForumStatChip
              icon="text-box-outline"
              label={t('forums_topics_count', {count: forum.topic_count})}
              fg={FORUM_STAT_COLORS.topics.fg}
              bg={FORUM_STAT_COLORS.topics.bg}
            />
            <ForumStatChip
              icon="comment-text-outline"
              label={t('forums_posts_count', {count: forum.post_count})}
              fg={FORUM_STAT_COLORS.posts.fg}
              bg={FORUM_STAT_COLORS.posts.bg}
            />
            {forum.last_post_at ? (
              <ForumStatChip
                icon="clock-outline"
                label={formatForumDate(forum.last_post_at, i18n.language)}
                fg={FORUM_STAT_COLORS.activity.fg}
                bg={FORUM_STAT_COLORS.activity.bg}
              />
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  )
}

export default function Forums() {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const router = useRouter()
  const {colors} = useTheme()
  const {getCategories, getRegistrationStatus, joinForums} = useForums()

  const [categories, setCategories] = React.useState<ForumCategoryWithForums[]>(
    [],
  )
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showJoinModal, setShowJoinModal] = React.useState(false)
  const [joining, setJoining] = React.useState(false)
  const [joinError, setJoinError] = React.useState<string | null>(null)

  React.useEffect(() => {
    navigation.setOptions({
      title: t('forums'),
    })
  }, [navigation, t])

  const loadForums = React.useCallback(async () => {
    try {
      setError(null)
      const [registration, data] = await Promise.all([
        getRegistrationStatus(),
        getCategories(),
      ])

      if (registration.authenticated && !registration.is_member) {
        setShowJoinModal(true)
      }

      setCategories(data)
      if (data.length === 0 && !registration.is_member) {
        setError(t('forums_empty'))
      }
    } catch (e) {
      console.error(e)
      setError(t('forums_load_error'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [getCategories, getRegistrationStatus, t])

  React.useEffect(() => {
    loadForums()
  }, [loadForums])

  const sections: ForumSection[] = React.useMemo(
    () =>
      categories.map((category, categoryIndex) => ({
        title: category.name,
        description: category.description,
        categoryIndex,
        data: category.forums ?? [],
      })),
    [categories],
  )

  async function handleJoin() {
    try {
      setJoining(true)
      setJoinError(null)
      const ok = await joinForums()
      if (ok) {
        setShowJoinModal(false)
        await loadForums()
      } else {
        setJoinError(t('forums_join_error'))
      }
    } catch (e) {
      console.error(e)
      setJoinError(t('forums_join_error'))
    } finally {
      setJoining(false)
    }
  }

  function openForum(categorySlug: string, forum: ForumBoard) {
    router.push({
      pathname: '/Settings/Forums/board',
      params: {categorySlug, forumSlug: forum.slug, forumName: forum.name},
    })
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View className="flex-1">
      <SectionList
        sections={sections}
        keyExtractor={item => String(item.id)}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              loadForums()
            }}
          />
        }
        contentContainerClassName="pb-4"
        ListHeaderComponent={
          <ForumsHero title={t('forums')} subtitle={t('forums_hero_subtitle')} />
        }
        ListEmptyComponent={
          error ? (
            <Text className="px-6 py-8 text-center opacity-70">{error}</Text>
          ) : (
            <Text className="px-6 py-8 text-center opacity-70">
              {t('forums_empty')}
            </Text>
          )
        }
        renderSectionHeader={({section}) => (
          <ForumSectionHeader
            title={section.title}
            description={section.description}
            accentIndex={section.categoryIndex}
          />
        )}
        renderItem={({item, index, section}) => {
          const category = categories.find(c => c.name === section.title)
          if (!category) return null
          return (
            <ForumRow
              forum={item}
              accentIndex={section.categoryIndex + index}
              onPress={() => openForum(category.slug, item)}
            />
          )
        }}
      />

      <JoinForumsModal
        visible={showJoinModal}
        joining={joining}
        error={joinError}
        onJoin={handleJoin}
      />
    </View>
  )
}
