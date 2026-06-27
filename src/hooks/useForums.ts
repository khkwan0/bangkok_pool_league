import {useNetwork} from '@/hooks/useNetwork'
import type {
  ForumBoard,
  ForumCategoryWithForums,
  ForumPost,
  ForumPostSortOrder,
  ForumTopicDetail,
  ForumTopicListItem,
  ForumTopicPatchResult,
  ForumTopicUpdate,
  ForumTopicCreateInput,
  ForumTopicCreateResult,
  ForumPostsPage,
  ForumPostReactionState,
  ForumReactionIcon,
  Paginated,
} from '@/types/forums'

function encodePath(...segments: string[]) {
  return segments.map(s => encodeURIComponent(s)).join('/')
}

export function useForums() {
  const {Get, Post, Put, Patch} = useNetwork()

  const getCategories = async (): Promise<ForumCategoryWithForums[]> => {
    const res = await Get('/forums')
    if (res?.status === 'ok' && Array.isArray(res.data)) {
      return res.data
    }
    return []
  }

  const getForum = async (
    categorySlug: string,
    forumSlug: string,
  ): Promise<ForumBoard | null> => {
    const res = await Get(`/forums/${encodePath(categorySlug, forumSlug)}`)
    if (res?.status === 'ok' && res.data) {
      return {
        ...res.data,
        can_pin: Boolean(res.data.can_pin),
        can_lock_hide: Boolean(res.data.can_lock_hide),
      }
    }
    return null
  }

  const getTopics = async (
    categorySlug: string,
    forumSlug: string,
    page = 1,
  ): Promise<Paginated<ForumTopicListItem> & {forum: ForumBoard}> => {
    const res = await Get(
      `/forums/${encodePath(categorySlug, forumSlug)}/topics?page=${page}`,
    )
    if (res?.status === 'ok' && res.data) {
      return res.data
    }
    return {
      forum: {} as ForumBoard,
      items: [],
      page: 1,
      page_size: 20,
      total: 0,
      total_pages: 1,
    }
  }

  const getTopic = async (
    categorySlug: string,
    forumSlug: string,
    topicSlug: string,
  ): Promise<ForumTopicDetail | null> => {
    const res = await Get(
      `/forums/${encodePath(categorySlug, forumSlug)}/topics/${encodeURIComponent(topicSlug)}`,
    )
    if (res?.status === 'ok' && res.data) {
      return {
        ...res.data,
        can_reply: Boolean(res.data.can_reply),
        can_moderate: Boolean(res.data.can_moderate),
        can_manage: Boolean(res.data.can_manage),
        can_pin: Boolean(res.data.can_pin),
        can_lock_hide: Boolean(res.data.can_lock_hide),
      }
    }
    return null
  }

  const getPosts = async (
    categorySlug: string,
    forumSlug: string,
    topicSlug: string,
    page = 1,
    sort: ForumPostSortOrder = 'asc',
  ): Promise<ForumPostsPage> => {
    const res = await Get(
      `/forums/${encodePath(categorySlug, forumSlug)}/topics/${encodeURIComponent(topicSlug)}/posts?page=${page}&sort=${sort}`,
    )
    if (res?.status === 'ok' && res.data) {
      return {
        ...res.data,
        original_post: res.data.original_post ?? null,
        reaction_icons: res.data.reaction_icons ?? [],
        reactions_by_post_id: res.data.reactions_by_post_id ?? {},
      }
    }
    return {
      items: [],
      original_post: null,
      reaction_icons: [],
      reactions_by_post_id: {},
      page: 1,
      page_size: 20,
      total: 0,
      total_pages: 1,
    }
  }

  const getRegistrationStatus = async (): Promise<{
    authenticated: boolean
    is_member: boolean
  }> => {
    const res = await Get('/forums/register')
    return {
      authenticated: Boolean(res?.authenticated),
      is_member: Boolean(res?.is_member),
    }
  }

  const joinForums = async (): Promise<boolean> => {
    const res = await Post('/forums/register', {})
    return res?.status === 'ok'
  }

  const createReply = async (
    categorySlug: string,
    forumSlug: string,
    topicSlug: string,
    content: string,
    isAnonymous = false,
  ) => {
    return Post(
      `/forums/${encodePath(categorySlug, forumSlug)}/topics/${encodeURIComponent(topicSlug)}/posts`,
      {content, is_anonymous: isAnonymous},
    )
  }

  const createTopic = async (
    categorySlug: string,
    forumSlug: string,
    input: ForumTopicCreateInput,
  ): Promise<ForumTopicCreateResult> => {
    const res = await Post(
      `/forums/${encodePath(categorySlug, forumSlug)}/topics`,
      {
        title: input.title.trim(),
        content: input.content?.trim() ?? '',
        is_anonymous: Boolean(input.is_anonymous),
        ...(input.is_pinned != null ? {is_pinned: input.is_pinned} : {}),
        ...(input.is_locked != null ? {is_locked: input.is_locked} : {}),
        ...(input.is_hidden != null ? {is_hidden: input.is_hidden} : {}),
      },
    )
    if (res?.status === 'ok' && res.topic_slug) {
      return {
        status: 'ok',
        topic_slug: res.topic_slug,
        topic_id: res.topic_id,
      }
    }
    return {status: 'error', error: res?.error ?? 'server_error'}
  }

  const getReactionIcons = async (): Promise<ForumReactionIcon[]> => {
    const res = await Get('/forums/reaction-icons')
    if (Array.isArray(res?.data)) {
      return res.data
    }
    return []
  }

  const getPostReactions = async (
    postIds: number[],
  ): Promise<{
    reaction_icons: ForumReactionIcon[]
    reactions_by_post_id: Record<number, ForumPostReactionState>
  }> => {
    if (postIds.length === 0) {
      return {reaction_icons: [], reactions_by_post_id: {}}
    }
    const res = await Get(
      `/forums/posts/reactions?post_ids=${postIds.join(',')}`,
    )
    if (res?.status === 'ok' && res.data) {
      return {
        reaction_icons: res.data.reaction_icons ?? [],
        reactions_by_post_id: res.data.reactions_by_post_id ?? {},
      }
    }
    return {reaction_icons: [], reactions_by_post_id: {}}
  }

  const addPostReaction = async (
    postId: number,
    iconId: number,
  ): Promise<
    ForumPostReactionState | {status: 'error'; error: string}
  > => {
    const res = await Post(`/forums/posts/${postId}/reactions`, {
      icon_id: iconId,
    })
    if (res?.status === 'ok' && res.reactions) {
      return res.reactions as ForumPostReactionState
    }
    return {status: 'error', error: res?.error ?? 'server_error'}
  }

  const updatePost = async (
    postId: number,
    content: string,
  ): Promise<{status: 'ok'; edited_at: string} | {status: 'error'; error: string}> => {
    const res = await Put(`/forums/posts/${postId}`, {content: content.trim()})
    if (res?.status === 'ok' && res.edited_at) {
      return {status: 'ok', edited_at: res.edited_at}
    }
    return {status: 'error', error: res?.error ?? 'server_error'}
  }

  const updateTopic = async (
    categorySlug: string,
    forumSlug: string,
    topicSlug: string,
    updates: ForumTopicUpdate,
  ): Promise<ForumTopicPatchResult> => {
    const res = await Patch(
      `/forums/${encodePath(categorySlug, forumSlug)}/topics/${encodeURIComponent(topicSlug)}`,
      updates,
    )
    if (res?.status === 'ok') {
      return {status: 'ok', topic_slug: res.topic_slug}
    }
    return {status: 'error', error: res?.error ?? 'server_error'}
  }

  return {
    getCategories,
    getForum,
    getTopics,
    getTopic,
    getPosts,
    getReactionIcons,
    getPostReactions,
    getRegistrationStatus,
    joinForums,
    createTopic,
    createReply,
    addPostReaction,
    updatePost,
    updateTopic,
  }
}
