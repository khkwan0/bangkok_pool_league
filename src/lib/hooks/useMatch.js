import {useNetwork} from '~/lib/hooks'

export const useMatch = () => {
  const {Get} = useNetwork()

  const GetFrames = async matchId => {
    try {
      const frames = await Get('/frames/' + matchId)
      return frames
    } catch (e) {
      return []
    }
  }

  const GetMatchInfo = async matchId => {
    try {
      console.log(matchId)
      const res = await Get('/match/' + matchId)
      return res
    } catch (e) {
      return {}
    }
  }

  return {GetFrames, GetMatchInfo}
}