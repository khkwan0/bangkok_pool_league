import React from 'react'
// import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createStackNavigator} from '@react-navigation/stack'
import ProfileHome from './ProfileHome'
import PlayerStats from './PlayerStats'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'
import {useSelector} from 'react-redux'

const ProfileStack = createStackNavigator()

const ProfilesNav = props => {
  const user = useSelector(_state => _state.userData).user
  const {colors} = useYBase()
  const {t} = useTranslation()
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: colors.onHeaderBackground,
        headerTitleAlign: 'center',
      }}>
      <ProfileStack.Screen
        name="Root"
        component={ProfileHome}
        options={{
          title: user.nickname,
        }}
      />
      <ProfileStack.Screen name="Player Statistics" component={PlayerStats} />
    </ProfileStack.Navigator>
  )
}

export default ProfilesNav
