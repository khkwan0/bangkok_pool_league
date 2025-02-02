import type {DivisionData} from '@/types'

export interface League {
  GetStandings(): Promise<DivisionData[]>
  // Add other methods as needed
}

export function useLeague(): League
