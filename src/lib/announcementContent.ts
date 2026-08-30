/** Prefix relative announcement gallery URLs with the API base for mobile rendering. */
export function resolveAnnouncementContent(
  content: string,
  apiUrl: string,
): string {
  const base = apiUrl.replace(/\/$/, '')
  return content.replace(
    /(\!\[[^\]]*\]\()(\/(?:api\/)?announcements(?:\/gallery\/serve|_gallery)\/[^)]+)(\))/g,
    `$1${base}$2$3`,
  )
}

export function buildAnnouncementImageEmbed(apiUrl: string, path: string): string {
  const base = apiUrl.replace(/\/$/, '')
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`
  return `\n![image](${url})\n`
}
