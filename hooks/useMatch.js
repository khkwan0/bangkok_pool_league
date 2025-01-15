import {useNetwork} from '@/hooks/useNetwork'

export const useMatch = () => {
  const {Get, Post} = useNetwork()

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

  const UpdateCompletedMatch = async (type, matchId, data) => {
    try {
      const res = await Post('/admin/match/completed', {
        type: type,
        matchId: matchId,
        data: data,
      })
      return res
    } catch (e) {
      return {status: 'error', error: 'network_error'}
    }
  }

  const RescheduleMatch = async (matchId, newDate) => {
    try {
      const res = await Post('/admin/match/date', {
        matchId: matchId,
        newDate: newDate,
      })
      return res
    } catch (e) {
      throw new Error(e)
    }
  }

  return {
    GetFrames,
    GetMatchInfo,
    GetMatchDetails,
    RescheduleMatch,
    UpdateCompletedMatch,
  }
}
