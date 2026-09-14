import {useNetwork} from '@/hooks/useNetwork'

export function useTournaments() {
  const {Get} = useNetwork()

  const list = async (opts?: {
    season_id?: number | null
    mini_league_id?: number | null
  }) => {
    const params = new URLSearchParams()
    if (opts?.mini_league_id) {
      params.set('mini_league_id', String(opts.mini_league_id))
    } else if (opts?.season_id) {
      params.set('season_id', String(opts.season_id))
    }
    const qs = params.toString()
    return Get(`/tournaments${qs ? `?${qs}` : ''}`)
  }

  const getBracket = async (id: number) => Get(`/tournaments/${id}/bracket`)

  return {list, getBracket}
}
