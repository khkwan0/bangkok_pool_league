import {createContext, useContext, useReducer} from 'react'

interface User {
  id?: number
  role_id: number
  teams?: Array<{id: number, team_role_id: number}>
}

interface LeagueState {
  user: User
  season: number
}

export interface LeagueContextType {
  state: LeagueState
  dispatch: React.Dispatch<any>
}

const LeagueContext = createContext<LeagueContextType>({} as LeagueContextType)

const initialState: LeagueState = {
  user: {},
  season: 0,
}

const LeagueReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: {...action.payload},
      }
    case 'DEL_USER': {
      return {
        ...state,
        user: {},
      }
    }
    case 'SET_SEASON': {
      return {
        ...state,
        season: action.payload,
      }
    }
    default:
      return state
  }
}

export const LeagueProvider = ({children}: any) => {
  const [state, dispatch] = useReducer(LeagueReducer, initialState)

  return (
    <LeagueContext.Provider value={{state, dispatch}}>
      {children}
    </LeagueContext.Provider>
  )
}

export const useLeagueContext = () => useContext(LeagueContext)
