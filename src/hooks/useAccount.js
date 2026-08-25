import config from '@/config'
import {useLeagueContext} from '@/context/LeagueContext'
import {useNetwork} from '@/hooks/useNetwork'
import {ensureUserChannels} from '@/lib/notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {getMessaging, getToken} from '@react-native-firebase/messaging'
import {Platform} from 'react-native'

export const useAccount = () => {
  const {state, dispatch} = useLeagueContext()
  const user = state?.user || null
  const {Get, Post} = useNetwork()

  const LoadUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user')
      return user
    } catch (e) {
      console.log(e)
    }
  }

  // uses jwt
  const FetchUser = async () => {
    try {
      let userData = user
      if (!user?.id) {
        userData = await Get('/user')
        dispatch({type: 'SET_USER', payload: userData})
      }

      try {
        const messaging = getMessaging()
        const token = await getToken(messaging)
        await Post('/user/token', {token: token})
        await ensureUserChannels({
          includeAdmin: userData?.role_id === 9,
        })
      } catch (tokenError) {
        console.error('Error registering FCM token:', tokenError)
      }

      return userData
    } catch (e) {
      console.log(e)
      console.log('no user')
    }
  }

  const RefreshPushToken = async () => {
    try {
      const messaging = getMessaging()
      const token = await getToken(messaging)
      await Post('/user/token', {token: token})
      return token
    } catch (e) {
      console.error('Error refreshing FCM token:', e)
    }
  }

  const UpdateUser = async (userId, user) => {
    try {
    } catch (e) {
      console.log(e)
    }
  }

  async function UserLogin(email, password) {
    try {
      if (email && password) {
        const res = await Post('/login', {email, password}, false)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          if (typeof res.data !== 'undefined' && res.data) {
            await AsyncStorage.setItem('jwt', res.data.token)
            const messaging = getMessaging()
            const token = await getToken(messaging)
            await Post('/user/token', {token: token})
            dispatch({type: 'SET_USER', payload: res.data.user})
            return {status: 'ok'}
          }
        } else {
          return res
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function AdminLogin(playerId) {
    try {
      if (playerId) {
        const res = await Post('/admin/login', {playerId}, false)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          if (typeof res.data !== 'undefined' && res.data) {
            await AsyncStorage.setItem('jwt', res.data.token)
            dispatch({type: 'SET_USER', payload: res.data.user})
            return {status: 'ok'}
          }
        } else {
          return res
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function Logout(network = true) {
    await AsyncStorage.removeItem('user')
    dispatch({type: 'DEL_USER'})
    if (network) {
      await Get('/logout')
    }
    await AsyncStorage.removeItem('jwt')
  }

  async function SocialLogin(platform, data) {
    try {
      const res = await Post('/login/social/' + platform, {data})
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        if (typeof res.data !== 'undefined' && res.data) {
          await AsyncStorage.setItem('jwt', res.data.token)
          dispatch({type: 'SET_USER', payload: res.data.user})
          return {status: 'ok'}
        }
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async function Register(
    email,
    password1,
    password2,
    nickname,
    firstName,
    lastName,
  ) {
    try {
      const res = await Post('/login/register', {
        email,
        password1,
        password2,
        nickname,
        firstName,
        lastName,
      })
      if (res.status === 'ok') {
        await AsyncStorage.setItem('jwt', res.data.token)
      }
      return res
    } catch (e) {
      console.log(e)
    }
  }

  async function Recover(email) {
    try {
      const res = await Post('/login/recover', {email: email})
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function Verify(code, pw1, pw2) {
    try {
      const res = await Post('/login/recover/verify', {
        code: code,
        password: pw1,
        passwordConfirm: pw2,
      })
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function DeleteAccount() {
    try {
      const res = await Get('/account/delete')
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function SetFirstName(text) {
    try {
      const res = await Post('/account/first_name', {name: text})
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function SetLastName(text) {
    try {
      const res = await Post('/account/last_name', {name: text})
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function SetNickName(text) {
    try {
      const res = await Post('/account/nick_name', {name: text})
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function SaveAvatar(path) {
    try {
      const token = await AsyncStorage.getItem('jwt')
      const data = new FormData()
      data.append('photo', {uri: path, name: 'oho', type: 'image/jpg'})
      const res = await fetch(config.apiUrl + '/avatar', {
        method: 'POST',
        body: data,
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })
      const json = await res.json()
      return json
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  const CheckVersion = async () => {
    try {
      const url =
        Platform.OS === 'ios'
          ? `https://itunes.apple.com/lookup?lang=en&bundleId=com.bangkok-pool-league&country=us&_=${new Date().valueOf()}`
          : 'https://play.google.com/store/apps/details?id=com.bangkok_pool_league&hl=us'
      const res = await fetch(url)
      if (typeof res.ok !== 'undefined' && res.ok) {
        if (Platform.OS === 'ios') {
          const json = await res.json()
          if (
            typeof json.results !== 'undefined' &&
            Array.isArray(json.results)
          ) {
            return json.results[0].version > config.version
          } else {
            return false
          }
        } else {
          const text = await res.text()
          const version = text.match(/\[\[\[['"]((\d+\.)+\d+)['"]\]\],/)[1]
          console.log(version, config.version)
          if (version) {
            return version > config.version
          } else {
            return false
          }
        }
      } else {
        return false
      }
    } catch (e) {
      console.log(e)
      return false
    }
  }

  async function GetMessageConversation(userId) {
    try {
      const res = await Get('/message/conversation/' + userId)
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function GetMessageThreads() {
    try {
      const res = await Get('/message/threads')
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function GetMessages(userId) {
    try {
      const res = await Get('/messages/' + userId)
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function GetMessageHistory(threadId) {
    try {
      const res = await Get('/message/history/' + threadId)
      return res
    } catch (e) {
      console.log(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function MarkMessageAsRead(messageId) {
    try {
      const res = await Post('/message/read', {messageId})
      return res
    } catch (e) {
      console.log(e)
    }
  }

  async function DeleteMessage(messageId) {
    try {
      const res = await Post('/message/delete', {messageId})
      return res
    } catch (e) {
      console.log(e)
    }
  }

  async function DeleteThread(otherPlayerId) {
    try {
      const res = await Post('/message/thread/delete', {otherPlayerId})
      return res
    } catch (e) {
      console.log(e)
    }
  }

  async function GetUnreadMessageCount() {
    try {
      const res = await Get('/message/unread/count')
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        if (typeof res.data === 'number') {
          return res.data
        }
        if (typeof res.data !== 'undefined' && res.data !== null) {
          const count = Number(res.data)
          if (Number.isFinite(count)) {
            return count
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function SavePreferences(preferences) {
    try {
      const res = await Post('/user/preferences', {preferences})
      return res
    } catch (e) {
      console.error(e)
    }
  }

  async function MarkAllMessagesAsRead() {
    try {
      const res = await Post('/message/read/all', {})
      return res
    } catch (e) {
      console.error(e)
    }
  }

  async function SendMessage(
    senderId,
    recipientId,
    title,
    message,
    root_id = null,
  ) {
    try {
      const res = await Post('/message/send', {
        senderId,
        recipientId,
        title,
        message,
        root_id,
      })
      return res
    } catch (e) {
      console.error(e)
      return {status: 'error', message: e.message}
    }
  }

  async function SaveLanguage(lang) {
    try {
      const res = await Post('/user/language', {language: lang})
      dispatch({type: 'SET_LANGUAGE', payload: lang})
      return res
    } catch (e) {
      console.error(e)
    }
  }

  async function SetPushNotifications(enabled) {
    try {
      dispatch({
        type: 'SET_PREFERENCES',
        payload: {enabledPushNotifications: enabled},
      })
    } catch (e) {
      console.error(e)
    }
  }

  async function SetSoundNotifications(enabled) {
    try {
      dispatch({
        type: 'SET_PREFERENCES',
        payload: {soundNotifications: enabled},
      })
    } catch (e) {
      console.error(e)
    }
  }

  async function GetUserEmailLogin() {
    try {
      const res = await Get('/user/email/login')
      return res
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async function UpdateEmail(email) {
    try {
      const res = await Post('/user/email/update', {email})
      return res
    } catch (e) {
      console.error(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function UpdatePassword(currentPassword, newPassword) {
    try {
      const res = await Post('/user/password/update', {
        currentPassword,
        newPassword,
      })
      return res
    } catch (e) {
      console.error(e)
      return {status: 'error', error: 'server_error'}
    }
  }

  async function SetUpEmail(email, password, confirmPassword) {
    try {
      const res = await Post('/user/email/setup', {
        email,
        password,
        confirmPassword,
      })
      return res
    } catch (e) {
      console.error(e)
    }
  }

  async function SetNationality(nationality) {
    try {
      const res = await Post('/user/nationality', {nationality})
      return res
    } catch (e) {
      console.error(e)
    }
  }

  return {
    AdminLogin,
    CheckVersion,
    DeleteAccount,
    DeleteMessage,
    DeleteThread,
    FetchUser,
    GetMessageConversation,
    GetMessageThreads,
    GetMessages,
    GetMessageHistory,
    GetUnreadMessageCount,
    GetUserEmailLogin,
    LoadUser,
    Logout,
    MarkAllMessagesAsRead,
    MarkMessageAsRead,
    Register,
    Recover,
    RefreshPushToken,
    SaveAvatar,
    SendMessage,
    SetFirstName,
    SetLastName,
    SetNickName,
    SetNationality,
    SetPushNotifications,
    SetSoundNotifications,
    SetUpEmail,
    SaveLanguage,
    SavePreferences,
    SocialLogin,
    UpdateUser,
    UpdateEmail,
    UpdatePassword,
    UserLogin,
    Verify,
  }
}
