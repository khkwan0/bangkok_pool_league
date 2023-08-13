import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import Login from './Login'

const AuthStack = createNativeStackNavigator()

const Auth = props => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={Login} />
    </AuthStack.Navigator>
  )
}

export default Auth
