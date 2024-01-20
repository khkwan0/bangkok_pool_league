import {useNetwork} from '~/lib/hooks'

export const useLeague = () => {
  const {Get, Post} = useNetwork()

  const AddNewSeason = async (name = '', shortName = '', description = '') => {
    try {
      if (name && shortName) {
        const res = await Post('/admin/season/new', {
          name,
          shortName,
          description,
        })
        return res
      } else {
        return {status: 'error', error: 'invalid_parameters'}
      }
    } catch (e) {
      console.log(e)
      throw new Error(e.message)
    }
  }
  const GetSeason = async () => {
    try {
      const season = await Get('/season')
      return season.season
    } catch (e) {
      console.log('no season')
    }
  }

  const GetSeasonV2 = async () => {
    try {
      const season = await Get('/v2/season')
      return season
    } catch (e) {
      console.log('no season')
    }
  }

  const GetSeasons = async () => {
    try {
      const seasons = await Get('/seasons')
      return seasons
    } catch (e) {
      console.log(e)
    }
  }

  const GetPlayerInfo = async (playerId = 0) => {
    try {
      const playerInfo = await Get('/player/' + playerId)
      return playerInfo
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  }

  const GetPlayerStats = async (seasonId = null) => {
    try {
      const stats = await Get('/stats/players/' + seasonId)
      return stats
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const GetPlayerStatsInfo = async (playerId = 0) => {
    try {
      const playerInfo = await Get('/player/stats/info/' + playerId)
      return playerInfo
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const GetPlayers = async (activeOnly = false) => {
    try {
      const res = await Get('/players?active_only=' + activeOnly)
      return res
    } catch (e) {
      return []
    }
  }

  const GetUniquePlayers = async () => {
    try {
      const res = await Get('/players/unique')
      return res
    } catch (e) {
      return []
    }
  }

  const GetStandings = async (seasonId = null) => {
    try {
      if (seasonId) {
        const res = await Get('/league/standings/')
        return res
      } else {
        const res = await Get('/league/standings/' + seasonId)
        return res
      }
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const SaveNewPlayer = async (
    nickName = '',
    firstName = '',
    lastName = '',
    email = '',
    teamId = 0,
  ) => {
    try {
      const res = Post('/player', {
        nickName,
        firstName,
        lastName,
        email,
        teamId,
      })
      return res
    } catch (e) {
      console.log(e)
      return {status: 'err', msg: 'Save error'}
    }
  }

  const GetVenues = async () => {
    try {
      const res = await Get('/venues')
      return res
    } catch (e) {
      return []
    }
  }

  const GetTeamStats = async (seasonId = null) => {
    try {
      const res = await Get('/stats/teams/' + seasonId)
      return res
    } catch (e) {
      return []
    }
  }

  const GetTeams = async () => {
    try {
      const res = await Get('/teams')
      return res
    } catch (e) {
      return []
    }
  }

  const GetTeamsBySeason = async season => {
    try {
      const res = await Get('/teams/' + season)
      return res
    } catch (e) {
      return []
    }
  }

  const GetAdminTeamsBySeason = async season => {
    try {
      if (season) {
        const res = await Get('/admin/teams/' + season)
        return res
      }
    } catch (e) {
      return []
    }
  }

  const GetDivisionsBySeason = async season => {
    try {
      const res = await Get('/divisions/' + season)
      return res
    } catch (e) {
      return []
    }
  }

  const GetTeamInfo = async teamId => {
    try {
      const res = await Get('/team/' + teamId)
      return res
    } catch (e) {
      console.log(e)
      return {}
    }
  }

  const Migrate = async (oldSeason = '', newSeason = '') => {
    try {
      const res = await Post('/admin/migrate', {
        oldSeason: parseInt(oldSeason, 10),
        newSeason: parseInt(newSeason, 10),
      })
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: e.message}
    }
  }

  const ActivateSeason = async seasonId => {
    try {
      const res = await Get('/admin/season/activate/' + seasonId)
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: e.message}
    }
  }

  const SetTeamDivision = async (teamId, divisionId) => {
    try {
      const res = await Post('/admin/team/division', {teamId, divisionId})
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: e.message}
    }
  }

  const GetTeamDivisionsBySeason = async seasonId => {
    try {
      const res = await Get('/team/division/' + seasonId)
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: e.message}
    }
  }

  const SaveVenue = async venue => {
    try {
      const res = await Post('/venue', {venue: venue})
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: e.message}
    }
  }

  const GetAllVenues = async () => {
    try {
      const res = await Get('/venues/all')
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: e.message}
    }
  }

  const SaveNewTeam = async (name, venue) => {
    try {
      const res = await Post('/admin/team', {name, venue})
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: e.message}
    }
  }

  const AddPlayerToTeam = async (playerId, teamId) => {
    try {
      const res = await Post('/team/player', {playerId, teamId})
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'network_error'}
    }
  }

  const RevokePrivileges = async (playerId, teamId) => {
    try {
      const res = await Post('/player/privilege/revoke', {playerId, teamId})
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'network_error'}
    }
  }

  const GrantPrivilege = async (playerId, teamId, level) => {
    try {
      const res = await Post('/player/privilege/grant', {
        playerId,
        teamId,
        level,
      })
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'network_error'}
    }
  }

  const RemovePlayerFromTeam = async (playerId, teamId) => {
    try {
      const res = await Post('/team/player/remove', {
        playerId,
        teamId,
      })
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'network_error'}
    }
  }

  return {
    ActivateSeason,
    AddPlayerToTeam,
    AddNewSeason,
    GetAllVenues,
    GetDivisionsBySeason,
    GetPlayerInfo,
    GetPlayerStats,
    GetPlayerStatsInfo,
    GetPlayers,
    GetSeason,
    GetSeasonV2,
    GetStandings,
    GetSeasons,
    GetTeams,
    GetTeamsBySeason,
    GetTeamDivisionsBySeason,
    GetAdminTeamsBySeason,
    GetTeamInfo,
    GetTeamStats,
    GetUniquePlayers,
    GetVenues,
    GrantPrivilege,
    RevokePrivileges,
    RemovePlayerFromTeam,
    SaveNewPlayer,
    SaveNewTeam,
    SaveVenue,
    SetTeamDivision,
    Migrate,
  }
}
