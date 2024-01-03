import {useNetwork} from '~/lib/hooks'

export const useLeague = () => {
  const {Get, Post} = useNetwork()

  const GetSeason = async () => {
    try {
      const season = await Get('/season')
      return season.season
    } catch (e) {
      console.log('no season')
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

  const GetTeamInfo = async (teamId) => {
    try {
      const res = await Get('/team/' + teamId)
      return res
    } catch (e) {
      console.log(e)
      return {}
    }
  }

  return {
    GetPlayerInfo,
    GetPlayerStats,
    GetPlayerStatsInfo,
    GetPlayers,
    GetSeason,
    GetStandings,
    GetTeams,
    GetTeamInfo,
    GetTeamStats,
    GetVenues,
    SaveNewPlayer,
  }
}