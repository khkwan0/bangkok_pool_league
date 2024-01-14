import React from 'react'
// import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createStackNavigator} from '@react-navigation/stack'
import Login from './Login'
import RegisterPart2 from './RegisterPart2'
import RegisterPart1 from './RegisterPart1'
import RegisterSuccess from './RegisterSuccess'
import Recover from './Recover'
import RecoverVerify from './RecoverVerify'
import PostRecover from './PostRecover'
import {useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

// const AuthStack = createNativeStackNavigator()
const AuthStack = createStackNavigator()

const Auth = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: colors.onHeaderBackground,
        headerTitleAlign: 'center',
      }}>
      <AuthStack.Screen
        name="AuthLogin"
        component={Login}
        options={{headerTitle: t('login')}}
      />
      <AuthStack.Screen
        name="RegisterPart1"
        component={RegisterPart1}
        options={{headerTitle: t('sign_up')}}
      />
      <AuthStack.Screen
        name="RegisterPart2"
        component={RegisterPart2}
        options={{headerTitle: t('sign_up')}}
      />
      <AuthStack.Screen
        name="Register Success"
        component={RegisterSuccess}
        options={{headerTitle: t('sign_up')}}
      />
      <AuthStack.Screen
        name="Post Recover"
        component={PostRecover}
        options={{headerTitle: t('recover')}}
      />
      <AuthStack.Screen
        name="Recover"
        component={Recover}
        options={{headerTitle: t('recover')}}
      />
      <AuthStack.Screen
        name="Recover Verify"
        component={RecoverVerify}
        options={{headerTitle: t('recover')}}
      />
    </AuthStack.Navigator>
  )
}

export default Auth
