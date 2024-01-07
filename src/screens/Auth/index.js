import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import Login from './Login'
import Register from './Register'
import Recover from './Recover'
import {useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const AuthStack = createNativeStackNavigator()

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
        name="Register"
        component={Register}
        options={{headerTitle: t('sign_up')}}
      />
      <AuthStack.Screen name="Recover" component={Recover} />
    </AuthStack.Navigator>
  )
}

export default Auth
