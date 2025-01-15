import AsyncStorage from '@react-native-async-storage/async-storage'
import {useNetwork} from '@/hooks/useNetwork'
import messaging from '@react-native-firebase/messaging'
import config from '@/app/config'
import notifee, {AndroidImportance} from '@notifee/react-native'
import {Platform} from 'react-native'
import {useLeagueContext} from '@/context/LeagueContext'

export const useAccount = () => {
  const {state, dispatch} = useLeagueContext()
  const user = state.user
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
        const res = await Post('/user/token', {token: token})
        if (typeof userData.role_id !== 'undefined' && userData.role_id === 9) {
          await notifee.createChannel({
            id: 'Admin',
            name: 'Admin',
            vibration: true,
            lights: true,
            importance: AndroidImportance.HIGH,
          })
        }
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

  return {
    AdminLogin,
    CheckVersion,
    DeleteAccount,
    FetchUser,
    LoadUser,
    Logout,
    UpdateUser,
    SocialLogin,
    Register,
    Recover,
    Verify,
    SaveAvatar,
    SetFirstName,
    SetLastName,
    SetNickName,
    UserLogin,
  }
}
