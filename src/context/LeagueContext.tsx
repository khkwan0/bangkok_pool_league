import {createContext, useContext, useReducer} from 'react'
interface User {
  id?: number
  role_id?: number
  teams?: {id: number; team_role_id: number}[]
  profile_picture?: string
  nickname?: string
  first_name?: string
  last_name?: string
  firstname?: string
  lastname?: string
  language?: string
  nationality?: {
    id: number
    name_en: string
    name_th: string
    iso_3166_1_alpha_2_code: string
  }
  preferences?: {
    enabledPushNotifications?: boolean
    soundNotifications?: boolean
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
    case 'SET_LANGUAGE': {
      return {
        ...state,
        user: {...state.user, language: action.payload},
      }
    }
    case 'SET_NATIONALITY': {
      return {
        ...state,
        user: {...state.user, nationality: action.payload},
      }
    }
    case 'SET_NICKNAME': {
      return {
        ...state,
        user: {...state.user, nickname: action.payload},
      }
    }
    case 'SET_FIRST_NAME': {
      return {
        ...state,
        user: {...state.user, firstname: action.payload},
      }
    }
    case 'SET_LAST_NAME': {
      return {
        ...state,
        user: {...state.user, lastname: action.payload},
      }
    }
    case 'SET_PROFILE_PICTURE': {
      return {
        ...state,
        user: {...state.user, profile_picture: action.payload},
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
