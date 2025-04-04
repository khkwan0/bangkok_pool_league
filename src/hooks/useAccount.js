import AsyncStorage from '@react-native-async-storage/async-storage'
import {useNetwork} from '@/hooks/useNetwork'
import messaging from '@react-native-firebase/messaging'
import config from '@/config'
import notifee, {AndroidImportance} from '@notifee/react-native'
import {Platform} from 'react-native'
import {useLeagueContext} from '@/context/LeagueContext'

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
      if (
        typeof user === 'undefined' ||
        !user ||
        typeof user?.id === 'undefined' ||
        !user.id
      ) {
        const userData = await Get('/user')
        const token = await messaging().getToken()
        await Post('/user/token', {token: token})
        if (typeof userData.role_id !== 'undefined' && userData.role_id === 9) {
          await notifee.createChannel({
            id: 'Admin',
            name: 'Admin',
            vibration: true,
            lights: true,
            importance: AndroidImportance.HIGH,
          })
        }
        await notifee.createChannel({
          id: 'General',
          name: 'General',
          vibration: true,
          lights: true,
          importance: AndroidImportance.HIGH,
        })
        dispatch({type: 'SET_USER', payload: userData})
        return userData
      }
    } catch (e) {
      console.log(e)
      console.log('no user')
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
        /*
        const res = {
          email: 'khkwan0@gmail.com',
          id: 1,
          token: 'asd',
          firstName: 'Kenneth',
          lastName: 'K',
        }
    const user = useAppSelector
        */
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          if (typeof res.data !== 'undefined' && res.data) {
            await AsyncStorage.setItem('jwt', res.data.token)
            const token = await messaging().getToken()
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
      const res = await fetch('https://' + config.domain + '/avatar', {
        method: 'post',
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

  async function GetMessages(userId) {
    try {
      const res = await Get('/messages/' + userId)
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

  async function GetUnreadMessageCount() {
    try {
      const res = await Get('/message/unread/count')
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        if (typeof res.data !== 'undefined' && res.data) {
          return res.data
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

  async function SendMessage(senderId, recipientId, title, message) {
    try {
      const res = await Post('/message/send', {
        senderId,
        recipientId,
        title,
        message,
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
    FetchUser,
    GetMessages,
    GetUnreadMessageCount,
    GetUserEmailLogin,
    LoadUser,
    Logout,
    MarkAllMessagesAsRead,
    MarkMessageAsRead,
    Register,
    Recover,
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
