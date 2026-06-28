import config from '@/config'

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
