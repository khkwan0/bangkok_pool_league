import AsyncStorage from '@react-native-async-storage/async-storage'
import {useDispatch, useSelector} from 'react-redux'
import {useNetwork} from '~/lib/hooks'
import {SetUser, ClearUser} from '../../redux/userSlice'

export const useAccount = () => {
  const dispatch = useDispatch()
  const {user} = useSelector(_state => _state.userData).user
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
            dispatch(SetUser(res.data.user))
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
    dispatch(ClearUser())
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
          dispatch(SetUser(res.data.user))
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

  return {
    FetchUser,
    LoadUser,
    UserLogin,
    Logout,
    UpdateUser,
    SocialLogin,
    Register,
    Recover,
    Verify,
    DeleteAccount,
    SetFirstName,
    SetLastName,
    SetNickName,
  }
}
