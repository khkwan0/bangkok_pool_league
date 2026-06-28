import config from '@/config'
import {manipulateAsync, SaveFormat} from 'expo-image-manipulator'

/** Max height for the display/thumbnail variant saved alongside the original. */
export const FORUM_IMAGE_DISPLAY_MAX_HEIGHT = 480

const IMG_TAG_RE = /<img\b[^>]*\/?>/gi
const IMG_ATTR_RE = (name: string) =>
  new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i')

export function resolveForumImageUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed
  }
  const base = config.forumImagesUrl ?? config.logoUrl
  return base + trimmed.replace(/^\//, '')
}

export function parseForumImageTag(tag: string): {
  displayUrl: string
  fullUrl: string
} | null {
  const srcMatch = tag.match(IMG_ATTR_RE('src'))
  if (!srcMatch?.[1]) return null
  const displayUrl = resolveForumImageUrl(srcMatch[1])
  const fullMatch = tag.match(IMG_ATTR_RE('data-full'))
  const fullUrl = fullMatch?.[1]
    ? resolveForumImageUrl(fullMatch[1])
    : displayUrl
  return {displayUrl, fullUrl}
}

export function buildForumImageEmbed(
  displayFilename: string,
  originalFilename: string,
): string {
  return `\n<img src="${displayFilename}" data-full="${originalFilename}" alt="Forum image" />\n`
}

export function preserveForumImageTags(content: string): string {
  return content.replace(IMG_TAG_RE, match => `\n\n${match}\n\n`)
}

export async function createForumDisplayImage(
  uri: string,
  maxHeight = FORUM_IMAGE_DISPLAY_MAX_HEIGHT,
): Promise<{uri: string; width: number; height: number}> {
  const info = await manipulateAsync(uri, [], {})
  if (info.height <= maxHeight) {
    return {uri, width: info.width, height: info.height}
  }
  const resized = await manipulateAsync(
    uri,
    [{resize: {height: maxHeight}}],
    {compress: 0.85, format: SaveFormat.JPEG},
  )
  return {
    uri: resized.uri,
    width: resized.width,
    height: resized.height,
  }
}
