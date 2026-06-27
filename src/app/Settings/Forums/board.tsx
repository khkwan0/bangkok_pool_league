import {formatForumDate, topicSlug} from '@/components/Forums/formatForumDate'
import {ForumIconBadge, ForumStatChip} from '@/components/Forums/ForumUiParts'
import {FORUM_STAT_COLORS, getForumAccent} from '@/components/Forums/forumUi'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeagueContext} from '@/context/LeagueContext'
import {useForums} from '@/hooks/useForums'
import type {ForumBoard, ForumTopicListItem} from '@/types/forums'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {useTheme} from '@react-navigation/native'
import {useLocalSearchParams, useRouter, Stack} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  useColorScheme,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

function ForumNewTopicFab({onPress}: {onPress: () => void}) {
  const {t} = useTranslation()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Pressable
      onPress={onPress}
      className="absolute right-4 flex-row items-center rounded-full px-5 py-3.5"
      style={{
        bottom: insets.bottom + 16,
        backgroundColor: '#2196F3',
        shadowColor: '#1565C0',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: isDark ? 0.4 : 0.28,
        shadowRadius: 8,
        elevation: 6,
      }}>
      <MCI name="plus" size={20} color="#fff" style={{marginRight: 8}} />
      <Text className="font-bold text-white">{t('forums_new_topic')}</Text>
    </Pressable>
  )
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function TopicRow({
  topic,
  accentIndex,
  onPress,
}: {
  topic: ForumTopicListItem
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
      className="mb-3 overflow-hidden rounded-2xl"
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: topic.is_pinned
          ? 'rgba(233, 30, 99, 0.45)'
          : accent.border,
        shadowColor: accent.fg,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: isDark ? 0.12 : 0.07,
        shadowRadius: 5,
        elevation: 2,
      }}>
      <View
        className="absolute bottom-0 left-0 top-0 w-1.5"
        style={{
          backgroundColor: topic.is_pinned
            ? FORUM_STAT_COLORS.pinned.fg
            : accent.fg,
        }}
      />
      <View className="flex-row items-start px-4 py-3.5 pl-5">
        <ForumIconBadge
          icon={
            topic.is_locked
              ? 'lock'
              : topic.is_pinned
                ? 'pin'
                : 'comment-text-outline'
          }
          fg={topic.is_pinned ? FORUM_STAT_COLORS.pinned.fg : accent.fg}
          bg={topic.is_pinned ? FORUM_STAT_COLORS.pinned.bg : accent.bg}
        />
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 pr-2 text-base font-bold">{topic.title}</Text>
            <MCI
              name="chevron-right"
              size={22}
              color={topic.is_pinned ? FORUM_STAT_COLORS.pinned.fg : accent.fg}
            />
          </View>
          <Text className="mt-1 text-sm font-medium" style={{color: accent.fg}}>
            {topic.author_name}
          </Text>
          <Text className="mt-0.5 text-xs opacity-60">
            {formatForumDate(topic.created_at, i18n.language)}
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {topic.is_pinned ? (
              <ForumStatChip
                icon="pin"
                label={t('forums_pinned')}
                fg={FORUM_STAT_COLORS.pinned.fg}
                bg={FORUM_STAT_COLORS.pinned.bg}
              />
            ) : null}
            {topic.is_locked ? (
              <ForumStatChip
                icon="lock"
                label={t('forums_locked_short')}
                fg={FORUM_STAT_COLORS.locked.fg}
                bg={FORUM_STAT_COLORS.locked.bg}
              />
            ) : null}
            <ForumStatChip
              icon="reply"
              label={t('forums_replies_count', {count: topic.reply_count})}
              fg={FORUM_STAT_COLORS.replies.fg}
              bg={FORUM_STAT_COLORS.replies.bg}
            />
            <ForumStatChip
              icon="eye-outline"
              label={t(
                topic.view_count === 1
                  ? 'forums_view_count'
                  : 'forums_views_count',
                {count: topic.view_count},
              )}
              fg={FORUM_STAT_COLORS.views.fg}
              bg={FORUM_STAT_COLORS.views.bg}
            />
          </View>
        </View>
      </View>
    </Pressable>
  )
}

export default function ForumTopics() {
  const {t} = useTranslation()
  const router = useRouter()
  const {colors} = useTheme()
  const {state} = useLeagueContext()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const params = useLocalSearchParams<{
    categorySlug: string
    forumSlug: string
    forumName?: string
  }>()
  const {getTopics} = useForums()

  const cat = firstParam(params.categorySlug)
  const forumKey = firstParam(params.forumSlug)
  const headerTitle = firstParam(params.forumName) ?? t('forums')

  const [forum, setForum] = React.useState<ForumBoard | null>(null)
  const [topics, setTopics] = React.useState<ForumTopicListItem[]>([])
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadPage = React.useCallback(
    async (pageNum: number, append = false) => {
      if (!cat || !forumKey) {
        setError(t('forums_load_error'))
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
        return
      }
      try {
        setError(null)
        const result = await getTopics(cat, forumKey, pageNum)
        if (!result.forum?.id && result.items.length === 0) {
          setError(t('forums_load_error'))
        }
        setForum(result.forum?.id ? result.forum : null)
        setTotalPages(result.total_pages)
        setPage(result.page)
        setTopics(prev =>
          append ? [...prev, ...result.items] : result.items,
        )
      } catch (e) {
        console.error(e)
        setError(t('forums_load_error'))
      } finally {
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
      }
    },
    [cat, forumKey, getTopics, t],
  )

  React.useEffect(() => {
    setLoading(true)
    loadPage(1)
  }, [cat, forumKey])

  function openTopic(topic: ForumTopicListItem) {
    if (!cat || !forumKey) return
    router.push({
      pathname: '/Settings/Forums/topic',
      params: {
        categorySlug: cat,
        forumSlug: forumKey,
        topicSlug: topicSlug(topic),
        title: topic.title,
      },
    })
  }

  function openNewTopic() {
    if (!cat || !forumKey || !forum) return
    router.push({
      pathname: '/Settings/Forums/new-topic',
      params: {
        categorySlug: cat,
        forumSlug: forumKey,
        forumName: forum.name,
      },
    })
  }

  function loadMore() {
    if (loadingMore || page >= totalPages) return
    setLoadingMore(true)
    loadPage(page + 1, true)
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{title: headerTitle}} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    )
  }

  const canCreateTopic = Boolean(state.user?.id && forum && !forum.is_locked)

  return (
    <>
      <Stack.Screen options={{title: headerTitle}} />
      <View className="flex-1">
        {forum?.description || forum?.is_locked ? (
          <View
            className="mx-4 mb-2 mt-3 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: isDark
                ? 'rgba(33, 150, 243, 0.18)'
                : 'rgba(33, 150, 243, 0.1)',
              borderWidth: 1,
              borderColor: isDark
                ? 'rgba(33, 150, 243, 0.35)'
                : 'rgba(33, 150, 243, 0.22)',
            }}>
            {forum.description ? (
              <Text className="text-sm" style={{color: isDark ? '#90CAF9' : '#1565C0'}}>
                {forum.description}
              </Text>
            ) : null}
            {forum.is_locked ? (
              <View className={forum.description ? 'mt-2' : undefined}>
                <ForumStatChip
                  icon="lock"
                  label={t('forums_locked')}
                  fg={FORUM_STAT_COLORS.locked.fg}
                  bg={FORUM_STAT_COLORS.locked.bg}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        <FlatList
          data={topics}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: canCreateTopic ? insets.bottom + 88 : 12,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true)
                loadPage(1)
              }}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <Text className="px-2 py-8 text-center opacity-70">
              {error ?? t('forums_no_topics')}
            </Text>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator className="py-4" color={colors.primary} />
            ) : null
          }
          renderItem={({item, index}) => (
            <TopicRow
              topic={item}
              accentIndex={index}
              onPress={() => openTopic(item)}
            />
          )}
        />
        {canCreateTopic ? <ForumNewTopicFab onPress={openNewTopic} /> : null}
      </View>
    </>
  )
}
