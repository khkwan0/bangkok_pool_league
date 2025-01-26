import {useNetwork} from '@/hooks/useNetwork'

export const useTeams = () => {
  const {Get, Post} = useNetwork()

  const GetPlayers = async (teamid = -1, activeOnly = false) => {
    try {
      if (teamid && Number.isInteger(teamid) && teamid >= 0) {
        const players = await Get(
          '/playersteam/players?teamid=' +
            teamid +
            '&active_only=' +
            activeOnly,
        )
        return players
      } else {
        return []
      }
    } catch (e) {
      console.log(e)
      return []
    }
  }

  const AddExistingPlayerToTeam = async (teamId, playerId) => {
    try {
      if (
        typeof teamId !== 'undefined' &&
        teamId &&
        typeof playerId !== 'undefined' &&
        playerId
      ) {
        const res = await Post('/team/player', {
          teamId: teamId,
          playerId: playerId,
        })
        return res
      } else {
        return {status: 'error', error: 'invalid_paramters'}
      }
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  const GetTeamInternalStats = async teamId => {
    try {
      if (teamId) {
        const res = await Get('/stats/team/players/internal/' + teamId)
        return res
      } else {
        return {status: 'error', error: 'invalid_paramters'}
      }
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  const GetTeamInfo = async teamId => {
    try {
      if (teamId) {
        const res = await Get('/team/' + teamId)
        return {status: 'ok', data: res}
      } else {
        return {status: 'error', error: 'invalid_paramters'}
      }
    } catch (e) {
      return {status: 'error', error: 'server_error'}
    }
  }

  return {
    GetPlayers,
    AddExistingPlayerToTeam,
    GetTeamInternalStats,
    GetTeamInfo,
  }
}
