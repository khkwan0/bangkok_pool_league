import config from '@/config'
import {Thread} from '@/components/Messages/types'
import {
  CANONICAL_COMPETITION,
  COMPETITION_STORAGE_KEY,
  parseStoredCompetition,
  type Competition,
} from '@/types/competition'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'

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
  nationality_id?: number
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
  messageThreads: Thread[]
  isNewMatchCard: boolean
  showLiveScores: boolean
  showForumFabBadge: boolean
  refreshUpcoming: boolean
  competition: Competition
  competitionPickerOpen: boolean
}

export interface LeagueContextType {
  state: LeagueState
  dispatch: React.Dispatch<any>
  LogoutUser: () => void
  RefreshUpcoming: () => void
  StopRefreshUpcoming: () => void
  setCompetition: (competition: Competition) => Promise<void>
  openCompetitionPicker: () => void
  closeCompetitionPicker: () => void
  apiUrl: string
  setApiUrl: (apiUrl: string) => Promise<void>
  resetApiUrl: () => Promise<void>
  webSocketUrl: string
  setWebSocketUrl: (webSocketUrl: string) => Promise<void>
  resetWebSocketUrl: () => Promise<void>
}

const LeagueContext = createContext<LeagueContextType>({} as LeagueContextType)

const initialState: LeagueState = {
  user: {},
  messageCount: 0,
  messageThreads: [],
  season: 0,
  isNewMatchCard: false,
  showLiveScores: true,
  showForumFabBadge: true,
  refreshUpcoming: false,
  competition: CANONICAL_COMPETITION,
  competitionPickerOpen: false,
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
    case 'SET_MESSAGE_THREADS': {
      // Calculate total unread count from threads
      const totalUnread = action.payload.reduce(
        (sum: number, thread: Thread) => {
          return sum + (thread.unread_count || 0)
        },
        0,
      )

      return {
        ...state,
        messageThreads: action.payload,
        messageCount: totalUnread,
      }
    }
    case 'UPDATE_THREAD_UNREAD_COUNT': {
      const {playerId, unreadCount} = action.payload
      const updatedThreads = state.messageThreads.map((thread: Thread) => {
        if (thread.other_player_id === playerId) {
          return {
            ...thread,
            unread_count: unreadCount,
          }
        }
        return thread
      })

      // Calculate new total unread count
      const totalUnread = updatedThreads.reduce(
        (sum: number, thread: Thread) => {
          return sum + (thread.unread_count || 0)
        },
        0,
      )

      return {
        ...state,
        messageThreads: updatedThreads,
        messageCount: totalUnread,
      }
    }
    case 'DECREMENT_THREAD_UNREAD_COUNT': {
      const {playerId, decrementBy} = action.payload
      const updatedThreads = state.messageThreads.map((thread: Thread) => {
        if (thread.other_player_id === playerId) {
          const currentUnread = thread.unread_count || 0
          const newUnread = Math.max(0, currentUnread - decrementBy)
          return {
            ...thread,
            unread_count: newUnread,
          }
        }
        return thread
      })

      // Calculate new total unread count
      const totalUnread = updatedThreads.reduce(
        (sum: number, thread: Thread) => {
          return sum + (thread.unread_count || 0)
        },
        0,
      )

      return {
        ...state,
        messageThreads: updatedThreads,
        messageCount: totalUnread,
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
    case 'SET_FORUM_FAB_BADGE': {
      return {
        ...state,
        showForumFabBadge: action.payload,
      }
    }
    case 'SET_REFRESH_UPCOMING': {
      return {
        ...state,
        refreshUpcoming: action.payload,
      }
    }
    case 'SET_COMPETITION': {
      return {
        ...state,
        competition: action.payload as Competition,
      }
    }
    case 'SET_COMPETITION_PICKER_OPEN': {
      return {
        ...state,
        competitionPickerOpen: Boolean(action.payload),
      }
    }
    default:
      return state
  }
}

export const LeagueProvider = ({children}: any) => {
  const [state, dispatch] = useReducer(LeagueReducer, initialState)
  const [apiUrl, setApiUrlState] = useState<string>(config.apiUrl)
  const [webSocketUrl, setWebSocketUrlState] = useState<string>(
    config.webSocketUrl,
  )
  useEffect(() => {
    const loadApiUrl = async () => {
      try {
        const savedApiUrl = await AsyncStorage.getItem('api_url')
        if (savedApiUrl) {
          setApiUrlState(savedApiUrl)
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadApiUrl()
  }, [])

  useEffect(() => {
    const loadWebSocketUrl = async () => {
      try {
        const savedWebSocketUrl = await AsyncStorage.getItem('web_socket_url')
        if (savedWebSocketUrl) {
          setWebSocketUrlState(savedWebSocketUrl)
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadWebSocketUrl()
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
    const getShowForumFabBadge = async () => {
      try {
        const stored = await AsyncStorage.getItem('show_forum_fab_badge')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (typeof parsed?.show === 'boolean') {
            dispatch({type: 'SET_FORUM_FAB_BADGE', payload: parsed.show})
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    getMatchCardDesign()
    getShowLiveScores()
    getShowForumFabBadge()
  }, [])

  useEffect(() => {
    const loadCompetition = async () => {
      try {
        const raw = await AsyncStorage.getItem(COMPETITION_STORAGE_KEY)
        dispatch({
          type: 'SET_COMPETITION',
          payload: parseStoredCompetition(raw),
        })
      } catch (e) {
        console.error(e)
      }
    }
    loadCompetition()
  }, [])

  async function LogoutUser() {
    try {
      await AsyncStorage.removeItem('jwt')
      dispatch({type: 'DEL_USER'})
      dispatch({type: 'SET_COMPETITION', payload: CANONICAL_COMPETITION})
      await AsyncStorage.setItem(
        COMPETITION_STORAGE_KEY,
        JSON.stringify(CANONICAL_COMPETITION),
      )
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

  const setCompetition = useCallback(async (competition: Competition) => {
    dispatch({type: 'SET_COMPETITION', payload: competition})
    try {
      await AsyncStorage.setItem(
        COMPETITION_STORAGE_KEY,
        JSON.stringify(competition),
      )
    } catch (e) {
      console.error('Failed to save competition:', e)
    }
  }, [])

  const openCompetitionPicker = useCallback(() => {
    dispatch({type: 'SET_COMPETITION_PICKER_OPEN', payload: true})
  }, [])

  const closeCompetitionPicker = useCallback(() => {
    dispatch({type: 'SET_COMPETITION_PICKER_OPEN', payload: false})
  }, [])

  async function setApiUrl(newApiUrl: string) {
    try {
      setApiUrlState(newApiUrl)
      await AsyncStorage.setItem('api_url', newApiUrl)
    } catch (e) {
      console.error('Failed to save api url:', e)
    }
  }

  async function resetApiUrl() {
    try {
      setApiUrlState(config.apiUrl)
      await AsyncStorage.removeItem('api_domain')
    } catch (e) {
      console.error('Failed to reset domain:', e)
    }
  }

  async function setWebSocketUrl(newWebSocketUrl: string) {
    try {
      setWebSocketUrlState(newWebSocketUrl)
      await AsyncStorage.setItem('web_socket_url', newWebSocketUrl)
    } catch (e) {
      console.error('Failed to save web socket domain:', e)
    }
  }

  async function resetWebSocketUrl() {
    try {
      setWebSocketUrlState(config.webSocketUrl)
      await AsyncStorage.removeItem('web_socket_domain')
    } catch (e) {
      console.error('Failed to reset web socket domain:', e)
    }
  }
  return (
    <LeagueContext.Provider
      value={{
        state,
        dispatch,
        LogoutUser,
        RefreshUpcoming,
        StopRefreshUpcoming,
        setCompetition,
        openCompetitionPicker,
        closeCompetitionPicker,
        apiUrl,
        setApiUrl,
        resetApiUrl,
        webSocketUrl,
        setWebSocketUrl,
        resetWebSocketUrl,
      }}>
      {children}
    </LeagueContext.Provider>
  )
}

export const useLeagueContext = () => useContext(LeagueContext)
