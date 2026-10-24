import config from '@/config'
import Constants from 'expo-constants'
import {Platform} from 'react-native'

/** Older pool builds have no leagueId in config. They stay on league 1. */
const LEGACY_POOL_LEAGUE_ID = 1

/** League id compiled into this build. Missing values stay on league 1. */
export function configuredLeagueId(): number {
  const id = Number(config.leagueId)
  if (Number.isFinite(id) && id > 0) return id
  return LEGACY_POOL_LEAGUE_ID
}

/** Marketing version + native build for announcement audience targeting. */
function appClientHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const version = Constants.expoConfig?.version
  if (version) {
    headers['X-App-Version'] = String(version)
  }
  const build =
    Platform.OS === 'ios'
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode
  if (build != null && String(build).trim() !== '') {
    headers['X-App-Build'] = String(build)
  }
  return headers
}

/** Sent on API calls so the backend does not infer the league from the host. */
export function leagueRequestHeaders(): Record<string, string> {
  return {
    'X-League-Id': String(configuredLeagueId()),
    ...appClientHeaders(),
  }
}
