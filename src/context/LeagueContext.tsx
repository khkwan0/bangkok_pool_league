import { domain as defaultDomain, webSocketDomain as defaultWebSocketDomain } from '@/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useReducer, useState } from 'react'
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
  email?: string
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
  domain: string
  setDomain: (domain: string) => Promise<void>
  resetDomain: () => Promise<void>
  webSocketDomain: string
  setWebSocketDomain: (domain: string) => Promise<void>
  resetWebSocketDomain: () => Promise<void>
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
  const [domain, setDomainState] = useState<string>(defaultDomain)
  const [webSocketDomain, setWebSocketDomainState] = useState<string>(defaultWebSocketDomain)

  useEffect(() => {
    const loadDomain = async () => {
      try {
        const savedDomain = await AsyncStorage.getItem('api_domain')
        if (savedDomain) {
          setDomainState(savedDomain)
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadDomain()
  }, [])

  useEffect(() => {
    const loadWebSocketDomain = async () => {
      try {
        const savedWebSocketDomain = await AsyncStorage.getItem('web_socket_domain')
        if (savedWebSocketDomain) {
          setWebSocketDomainState(savedWebSocketDomain)
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadWebSocketDomain()
  }, [])

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

  async function setDomain(newDomain: string) {
    try {
      setDomainState(newDomain)
      await AsyncStorage.setItem('api_domain', newDomain)
    } catch (e) {
      console.error('Failed to save domain:', e)
    }
  }

  async function resetDomain() {
    try {
      setDomainState(defaultDomain)
      await AsyncStorage.removeItem('api_domain')
    } catch (e) {
      console.error('Failed to reset domain:', e)
    }
  }

  async function setWebSocketDomain(newWebSocketDomain: string) {
    try {
      setWebSocketDomainState(newWebSocketDomain)
      await AsyncStorage.setItem('web_socket_domain', newWebSocketDomain)
    } catch (e) {
      console.error('Failed to save web socket domain:', e)
    }
  }

  async function resetWebSocketDomain() {
    try {
      setWebSocketDomainState(defaultWebSocketDomain)
      await AsyncStorage.removeItem('web_socket_domain')
    } catch (e) {
      console.error('Failed to reset web socket domain:', e)
    }
  }
  return (
    <LeagueContext.Provider value={{state, dispatch, LogoutUser, RefreshUpcoming, StopRefreshUpcoming, domain, setDomain, resetDomain, webSocketDomain, setWebSocketDomain, resetWebSocketDomain}}>
      {children}
    </LeagueContext.Provider>
  )
}

export const useLeagueContext = () => useContext(LeagueContext)
