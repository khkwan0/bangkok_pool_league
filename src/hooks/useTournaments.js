import {useNetwork} from '@/hooks/useNetwork'

function adminBase(scope) {
  if (scope?.type === 'mini' && Number(scope.id) > 0) {
    return `/mini-leagues/${scope.id}/tournaments`
  }
  return `/admin/tournaments`
}

export function useTournaments() {
  const {Get, Post, Put, Patch, Delete} = useNetwork()

  const list = async opts => {
    const params = new URLSearchParams()
    if (opts?.mini_league_id) {
      params.set('mini_league_id', String(opts.mini_league_id))
    } else if (opts?.season_id) {
      params.set('season_id', String(opts.season_id))
    }
    const qs = params.toString()
    return Get(`/tournaments${qs ? `?${qs}` : ''}`)
  }

  const getBracket = async id => Get(`/tournaments/${id}/bracket`)

  const getCompletedMatches = async id =>
    Get(`/tournaments/${id}/matches?status=completed`)

  /** Admin list (includes drafts). */
  const adminList = async scope => Get(adminBase(scope))

  const adminGet = async (scope, tournamentId) =>
    Get(`${adminBase(scope)}/${tournamentId}`)

  const adminPresets = async scope => Get(`${adminBase(scope)}/presets`)

  const adminCreate = async (scope, payload) => Post(adminBase(scope), payload)

  const adminUpdate = async (scope, tournamentId, payload) =>
    Put(`${adminBase(scope)}/${tournamentId}`, payload)

  const adminDelete = async (scope, tournamentId) =>
    Delete(`${adminBase(scope)}/${tournamentId}`)

  const adminAddEntry = async (scope, tournamentId, payload) =>
    Post(`${adminBase(scope)}/${tournamentId}/entries`, payload)

  const adminRemoveEntry = async (scope, tournamentId, entryId) =>
    Delete(`${adminBase(scope)}/${tournamentId}/entries?entry_id=${entryId}`)

  const adminSearchPlayers = async (scope, tournamentId, q) =>
    Get(
      `${adminBase(scope)}/${tournamentId}/player-search?q=${encodeURIComponent(
        q || '',
      )}`,
    )

  /** Full players table (root rows only used by callers). */
  const listAllPlayers = async () => Get('/players?all_players=true')

  const getSignupStatus = async tournamentId =>
    Get(`/tournaments/${tournamentId}/signup`)

  const selfSignup = async tournamentId =>
    Post(`/tournaments/${tournamentId}/signup`, {})

  const adminGenerateBracket = async (scope, tournamentId) =>
    Post(`${adminBase(scope)}/${tournamentId}/generate-bracket`, {})

  const adminConfirmBracket = async (scope, tournamentId) =>
    Post(`${adminBase(scope)}/${tournamentId}/confirm-bracket`, {})

  const adminGetBracketDraft = async (scope, tournamentId) =>
    Get(`${adminBase(scope)}/${tournamentId}/bracket-draft`)

  const adminDiscardBracketDraft = async (scope, tournamentId) =>
    Delete(`${adminBase(scope)}/${tournamentId}/bracket-draft`)

  const adminSwapBracketDraftSlots = async (scope, tournamentId, from, to) =>
    Patch(`${adminBase(scope)}/${tournamentId}/bracket-draft`, {from, to})

  const adminResetBracket = async (scope, tournamentId) =>
    Post(`${adminBase(scope)}/${tournamentId}/reset-bracket`, {})

  const adminMatchFormats = async scope => {
    if (scope?.type === 'mini' && Number(scope.id) > 0) {
      return Get(`/mini-leagues/${scope.id}/match-formats`)
    }
    return Get('/admin/match-formats')
  }

  return {
    list,
    getBracket,
    getCompletedMatches,
    adminList,
    adminGet,
    adminPresets,
    adminCreate,
    adminUpdate,
    adminDelete,
    adminAddEntry,
    adminRemoveEntry,
    adminSearchPlayers,
    listAllPlayers,
    getSignupStatus,
    selfSignup,
    adminGenerateBracket,
    adminConfirmBracket,
    adminGetBracketDraft,
    adminDiscardBracketDraft,
    adminSwapBracketDraftSlots,
    adminResetBracket,
    adminMatchFormats,
  }
}
