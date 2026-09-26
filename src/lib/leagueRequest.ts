import config from '@/config'

/** Older pool builds have no leagueId in config. They stay on league 1. */
const LEGACY_POOL_LEAGUE_ID = 1

/** League id compiled into this build. Missing values stay on league 1. */
export function configuredLeagueId(): number {
  const id = Number(config.leagueId)
  if (Number.isFinite(id) && id > 0) return id
  return LEGACY_POOL_LEAGUE_ID
}

/** Sent on API calls so the backend does not infer the league from the host. */
export function leagueRequestHeaders(): Record<string, string> {
  return {'X-League-Id': String(configuredLeagueId())}
}
