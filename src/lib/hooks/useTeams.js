import {useNetwork} from '~/lib/hooks'

export const useTeams = () => {
  const {Get, Post} = useNetwork()

  const GetPlayers = async (teamid = -1, activeOnly = false) => {
    try {
      if (teamid && Number.isInteger(teamid) && teamid >= 0) {
        const players = await Get(
          '/players?teamid=' + teamid + '&active_only=' + activeOnly,
        )
        return players
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

  return {GetPlayers, AddExistingPlayerToTeam}
}
