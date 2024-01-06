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

  const GetMatchDetails = async matchId => {
    try {
      const res = await Get('/match/details/' + matchId)
      return res
    } catch (e) {
      console.log(e)
      return {}
    }
  }

  const GetMatchInfo = async matchId => {
    try {
      const res = await Get('/match/' + matchId)
      return res
    } catch (e) {
      return {}
    }
  }

  return {GetFrames, GetMatchInfo, GetMatchDetails}
}
