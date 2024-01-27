/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createStackNavigator} from '@react-navigation/stack'
import PlayersHome from './PlayersHome'
import Player from './Player'
import PlayerStats from './PlayerStats'
import MatchScreen from './MatchScreen'
import RequestMerge from './RequestMerge'
import SuccessRequestMerge from './SuccessRequestMerge'
import {useNavigation} from '@react-navigation/native'
import {useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

// const PlayersStack = createNativeStackNavigator()
const PlayersStack = createStackNavigator()

const PlayersScreen = props => {
  const navigation = useNavigation()
  const {t} = useTranslation()
  const {colors} = useYBase()
  return (
    <PlayersStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: colors.onHeaderBackground,
        cardStyle: {backgroundColor: colors.background},
        headerTitleAlign: 'center',
      }}>
      <PlayersStack.Screen
        name="Root"
        component={PlayersHome}
        options={{headerTitle: t('players')}}
      />
      <PlayersStack.Screen name="Player" component={Player} />
      <PlayersStack.Screen name="Player Statistics" component={PlayerStats} />
      <PlayersStack.Screen name="Player Match Screen" component={MatchScreen} />
      <PlayersStack.Screen
        name="Request Merge"
        component={RequestMerge}
        options={{headerTitle: t('request_merge')}}
      />
      <PlayersStack.Screen
        name="Merge Request Success"
        component={SuccessRequestMerge}
        options={{headerTitle: t('request_merge')}}
      />
    </PlayersStack.Navigator>
  )
}

export default PlayersScreen
