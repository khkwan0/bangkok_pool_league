import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import Login from './Login'
import Register from './Register'
import Recover from './Recover'
import {useYBase} from '~/lib/hooks'

const AuthStack = createNativeStackNavigator()

const Auth = props => {
  const {colors} = useYBase()
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: {color: colors.onHeaderBackground},
        headerTitleAlign: 'center',
      }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register} />
      <AuthStack.Screen name="Recover" component={Recover} />
    </AuthStack.Navigator>
  )
}

export default Auth
