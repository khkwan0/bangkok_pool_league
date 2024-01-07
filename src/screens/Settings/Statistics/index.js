/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import StatisticsHome from './StatisticsHome'
import {IconButton} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'
import LeagueStandings from './LeagueStandings'
import TeamStatistics from './TeamStatistics'
import MatchScreen from './MatchScreen'
import PlayerStatistics from './PlayerStatistics'

const StatisticsStack = createNativeStackNavigator()

const StatisticsScreen = props => {
  const navigation = useNavigation()
  return (
    <StatisticsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <StatisticsStack.Screen name="Root" component={StatisticsHome} />
      <StatisticsStack.Screen
        name="League Standings"
        component={LeagueStandings}
      />
      <StatisticsStack.Screen
        name="Statistics Match Screen"
        component={MatchScreen}
      />
      <StatisticsStack.Screen
        name="Team Statistics"
        component={TeamStatistics}
      />
      <StatisticsStack.Screen
        name="Player Statistics"
        component={PlayerStatistics}
      />
    </StatisticsStack.Navigator>
  )
}

export default StatisticsScreen
