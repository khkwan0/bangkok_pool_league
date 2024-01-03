import {useNetwork} from '~/lib/hooks'

export const useTeams = () => {
  const {Get} = useNetwork()

  const GetPlayers = async (
    teamid = -1,
    activeOnly = false,
  ) => {
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

  return {GetPlayers}
}