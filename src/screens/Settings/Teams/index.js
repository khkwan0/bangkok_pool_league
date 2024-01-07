import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import TeamsHome from './TeamsHome'
import Team from './Team'
import {IconButton} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'
import Player from './Player'
import PlayerStats from './PlayerStats'
import MatchScreen from './MatchScreen'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'

const TeamsStack = createNativeStackNavigator()

const TeamsScreen = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()

  return (
    <TeamsStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: {color: colors.onHeaderBackground},
        headerTitleAlign: 'center',
      }}>
      <TeamsStack.Screen
        name="Root"
        component={TeamsHome}
        options={{
          title: t('teams'),
          headerTitleAlign: 'center',
        }}
      />
      <TeamsStack.Screen name="Team" component={Team} />
      <TeamsStack.Screen
        name="Player"
        component={Player}
        option={{title: 'Player'}}
      />
      <TeamsStack.Screen name="Player Statistics" component={PlayerStats} />
      <TeamsStack.Screen name="Player Match Screen" component={MatchScreen} />
    </TeamsStack.Navigator>
  )
}

export default TeamsScreen
