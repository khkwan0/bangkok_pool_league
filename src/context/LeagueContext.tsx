import {getAccountUsername} from 'expo/config'
import {createContext, useContext, useReducer} from 'react'
import {useAccount} from '@/hooks/useAccount'

interface User {
  id?: number
  role_id?: number
  teams?: Array<{id: number, team_role_id: number}>
  profile_picture?: string
  nickname?: string
  first_name?: string
  last_name?: string
  preferences?: {
    enabledPushNotifications?: boolean
    silentPushNotifications?: boolean
  }
}

interface LeagueState {
  user: User
  season: number
  messageCount: number
}

export interface LeagueContextType {
  state: LeagueState
  dispatch: React.Dispatch<any>
}

const LeagueContext = createContext<LeagueContextType>({} as LeagueContextType)

const initialState: LeagueState = {
  user: {},
  messageCount: 0,
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
    case 'SET_MESSAGE_COUNT': {
      return {
        ...state,
        messageCount: action.payload,
      }
    }
    case 'SET_PREFERENCES': {
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {...(state.user.preferences ?? {}), ...action.payload},
        },
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
