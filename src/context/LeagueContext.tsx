import {createContext, useContext, useReducer, useEffect} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
  isNewMatchCard: boolean
  showLiveScores: boolean
  refreshUpcoming: boolean
}

export interface LeagueContextType {
  state: LeagueState
  dispatch: React.Dispatch<any>
  LogoutUser: () => void
  RefreshUpcoming: () => void
  StopRefreshUpcoming: () => void
}

const LeagueContext = createContext<LeagueContextType>({} as LeagueContextType)

const initialState: LeagueState = {
  user: {},
  messageCount: 0,
  season: 0,
  isNewMatchCard: false,
  showLiveScores: true,
  refreshUpcoming: false,
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
    case 'SET_MATCH_CARD_DESIGN': {
      return {
        ...state,
        isNewMatchCard: action.payload,
      }
    }
    case 'SET_LIVE_SCORES': {
      return {
        ...state,
        showLiveScores: action.payload,
      }
    }
    case 'SET_REFRESH_UPCOMING': {
      return {
        ...state,
        refreshUpcoming: action.payload,
      }
    }
    default:
      return state
  }
}

export const LeagueProvider = ({children}: any) => {
  const [state, dispatch] = useReducer(LeagueReducer, initialState)

  useEffect(() => {
    const getMatchCardDesign = async () => {
      try {
        const _design = await AsyncStorage.getItem('opt_into_new')
        if (_design) {
          const design = JSON.parse(_design)
          if (typeof design?.optIn === 'boolean') {
            dispatch({type: 'SET_MATCH_CARD_DESIGN', payload: design.optIn})
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    const getShowLiveScores = async () => {
      try {
        const _showLiveScores = await AsyncStorage.getItem('show_live_scores')
        if (_showLiveScores) {
          const showLiveScores = JSON.parse(_showLiveScores as string)
          if (typeof showLiveScores?.show === 'boolean') {
            dispatch({type: 'SET_LIVE_SCORES', payload: showLiveScores.show})
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    getMatchCardDesign()
    getShowLiveScores()
  }, [])

  async function LogoutUser() {
    try {
      await AsyncStorage.removeItem('jwt')
      dispatch({type: 'DEL_USER'})
    } catch (e) {
      console.error(e)
    }
  }

  function RefreshUpcoming() {
    dispatch({type: 'SET_REFRESH_UPCOMING', payload: true})
  }

  function StopRefreshUpcoming() {
    dispatch({type: 'SET_REFRESH_UPCOMING', payload: false})
  }

  return (
    <LeagueContext.Provider value={{state, dispatch, LogoutUser, RefreshUpcoming, StopRefreshUpcoming}}>
      {children}
    </LeagueContext.Provider>
  )
}

export const useLeagueContext = () => useContext(LeagueContext)
