import config from '@/config'
import {useNetwork} from '@/hooks/useNetwork'
import {useLeagueContext} from '@/context/LeagueContext'
import type {
  Announcement,
  AnnouncementImageUploadResult,
  AdminAnnouncementListItem,
  PaginatedAdminAnnouncements,
  PaginatedAnnouncements,
} from '@/types/announcements'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useAnnouncements() {
  const {Get, Post, Put, Patch, Delete} = useNetwork()
  const {apiUrl} = useLeagueContext()

  const getAnnouncements = async (
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedAnnouncements> => {
    const res = await Get(`/announcements?page=${page}&pageSize=${pageSize}`)
    if (res?.status === 'ok' && res.data) {
      return res.data as PaginatedAnnouncements
    }
    return {items: [], total: 0}
  }

  const getAnnouncement = async (id: number): Promise<Announcement | null> => {
    const res = await Get(`/announcements?id=${id}`)
    if (res?.status === 'ok' && res.data) {
      return res.data as Announcement
    }
    return null
  }

  const getUnread = async (): Promise<Announcement | null> => {
    const res = await Get('/announcements/unread')
    if (res?.status === 'ok') {
      return (res.data as Announcement | null) ?? null
    }
    return null
  }

  const hasUnread = async (): Promise<boolean> => {
    const res = await Get('/announcements/unread?countOnly=1')
    if (res?.status === 'ok' && res.data) {
      return Boolean(res.data.hasUnread)
    }
    return false
  }

  const markRead = async (announcementId: number): Promise<boolean> => {
    const res = await Post('/announcements', {announcementId})
    return res?.status === 'ok'
  }

  const adminGetAnnouncements = async (
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedAdminAnnouncements> => {
    const res = await Get(
      `/admin/announcements?page=${page}&pageSize=${pageSize}`,
    )
    if (res?.items && Array.isArray(res.items)) {
      return {
        items: res.items as AdminAnnouncementListItem[],
        total: Number(res.total) || 0,
      }
    }
    return {items: [], total: 0}
  }

  const adminGetAnnouncement = async (
    id: number,
  ): Promise<Announcement | null> => {
    const res = await Get(`/admin/announcements?id=${id}`)
    if (res?.id) {
      return res as Announcement
    }
    return null
  }

  const adminCreate = async (payload: {
    title: string
    content: string
  }): Promise<{status: 'ok'; id: number} | {status: 'error'; error: string}> => {
    const res = await Post('/admin/announcements', payload)
    if (res?.status === 'ok' && res.id) {
      return {status: 'ok', id: Number(res.id)}
    }
    return {status: 'error', error: res?.error ?? 'server_error'}
  }

  const adminUpdate = async (payload: {
    id: number
    title: string
    content: string
  }): Promise<{status: 'ok'} | {status: 'error'; error: string}> => {
    const res = await Put('/admin/announcements', payload)
    if (res?.status === 'ok') {
      return {status: 'ok'}
    }
    return {status: 'error', error: res?.error ?? 'server_error'}
  }

  const adminDelete = async (
    id: number,
  ): Promise<{status: 'ok'} | {status: 'error'; error: string}> => {
    const res = await Delete(`/admin/announcements?id=${id}`)
    if (res?.status === 'ok') {
      return {status: 'ok'}
    }
    return {status: 'error', error: res?.error ?? 'server_error'}
  }

  const adminRestore = async (
    id: number,
  ): Promise<{status: 'ok'} | {status: 'error'; error: string}> => {
    const res = await Patch(`/admin/announcements?id=${id}`, {})
    if (res?.status === 'ok') {
      return {status: 'ok'}
    }
    return {status: 'error', error: res?.error ?? 'server_error'}
  }

  const adminUploadImage = async (
    originalUri: string,
  ): Promise<AnnouncementImageUploadResult> => {
    try {
      const token = await AsyncStorage.getItem('jwt')
      const data = new FormData()
      data.append('image', {
        uri: originalUri,
        name: 'announcement.jpg',
        type: 'image/jpeg',
      } as unknown as Blob)
      const apiDomain = apiUrl ?? config.apiUrl
      const res = await fetch(
        `${apiDomain}/admin/announcements/gallery/upload`,
        {
          method: 'POST',
          body: data,
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      const json = await res.json()
      if (json?.status === 'ok' && json.url) {
        return {status: 'ok', url: json.url, id: json.id}
      }
      return {status: 'error', error: json?.error ?? 'server_error'}
    } catch (e) {
      console.error(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  return {
    getAnnouncements,
    getAnnouncement,
    getUnread,
    hasUnread,
    markRead,
    adminGetAnnouncements,
    adminGetAnnouncement,
    adminCreate,
    adminUpdate,
    adminDelete,
    adminRestore,
    adminUploadImage,
  }
}
