import AsyncStorage from '@react-native-async-storage/async-storage'
import {useAppDispatch, useAppSelector} from '~/lib/hooks/redux'
import {useNetwork} from '~/lib/hooks'
import {SetUser} from '../../redux/userSlice'

export const useAccount = () => {
  const dispatch = useAppDispatch()
  const {user} = useAppSelector(_state => _state.user)
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
        dispatch(SetUser(userData))
      }
    } catch (e) {
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
      const res = await Post('/login', {email, password}, false)
      console.log(res)
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
          dispatch(SetUser(res.data.user))
          return {status: 'ok'}
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function Logout() {
    await AsyncStorage.removeItem('user')
    dispatch(ClearUser())
    await Get('/logout')
    await AsyncStorage.removeItem('jwt')
  }

  async function SocialLogin(platform, data) {
    try {
      const res = await Post('/login/social/' + platform, {data})
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        if (typeof res.data !== 'undefined' && res.data) {
          await AsyncStorage.setItem('jwt', res.data.token)
          dispatch(SetUser(res.data.user))
          return {status: 'ok'}
        }
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }

  return {FetchUser, LoadUser, UserLogin, Logout, UpdateUser, SocialLogin}
}
