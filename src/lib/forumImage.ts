import config from '@/config'
import {
  isAnnouncementImageUrl,
  resolveAnnouncementImageUrl,
} from '@/lib/announcementContent'

const IMG_TAG_RE = /<img\b[^>]*\/?>/gi
const IMG_ATTR_RE = (name: string) =>
  new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i')

function forumImagesOrigin(): string {
  const base = config.forumImagesUrl ?? config.logoUrl
  return base.replace(/\/forum_images\/?$/, '').replace(/\/$/, '')
}

export function resolveForumImageUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    if (isAnnouncementImageUrl(trimmed)) {
      return resolveAnnouncementImageUrl(trimmed)
    }
    return trimmed
  }
  if (isAnnouncementImageUrl(trimmed)) {
    return resolveAnnouncementImageUrl(trimmed)
  }
  if (trimmed.startsWith('/forum_images/')) {
    return `${forumImagesOrigin()}${trimmed}`
  }
  if (trimmed.startsWith('forum_images/')) {
    return `${forumImagesOrigin()}/${trimmed}`
  }
  const base = config.forumImagesUrl ?? config.logoUrl
  return base + trimmed.replace(/^\//, '')
}

/** Web posts use display filenames ending in `_display.jpg`. */
export function forumImageDisplayToOriginal(displaySrc: string): string | null {
  if (!/_display\.jpg$/i.test(displaySrc)) {
    return null
  }
  return displaySrc.replace(/_display\.jpg$/i, '_original.jpg')
}

export function resolveForumImageFullUrl(
  displaySrc: string,
  explicitFullSrc?: string | null,
): string {
  if (explicitFullSrc?.trim()) {
    return resolveForumImageUrl(explicitFullSrc)
  }
  const original = forumImageDisplayToOriginal(displaySrc)
  if (original) {
    return resolveForumImageUrl(original)
  }
  return resolveForumImageUrl(displaySrc)
}

export function parseForumImageTag(tag: string): {
  displayUrl: string
  fullUrl: string
} | null {
  const srcMatch = tag.match(IMG_ATTR_RE('src'))
  if (!srcMatch?.[1]) return null
  const displayUrl = resolveForumImageUrl(srcMatch[1])
  const fullMatch = tag.match(IMG_ATTR_RE('data-full'))
  const fullUrl = resolveForumImageFullUrl(srcMatch[1], fullMatch?.[1])
  return {displayUrl, fullUrl}
}

function toForumImagePath(filename: string): string {
  const trimmed = filename.trim()
  if (trimmed.startsWith('/forum_images/')) {
    return trimmed
  }
  return `/forum_images/${trimmed.replace(/^\//, '')}`
}

export function buildForumImageEmbed(
  displayFilename: string,
  originalFilename: string,
): string {
  const display = toForumImagePath(displayFilename)
  const full = toForumImagePath(originalFilename)
  return `\n<img src="${display}" data-full="${full}" alt="Forum image" />\n`
}

export function preserveForumImageTags(content: string): string {
  return content.replace(IMG_TAG_RE, match => `\n\n${match}\n\n`)
}
