/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import TeamsHome from './TeamsHome'
import Team from './Team'
import {IconButton} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'
import Player from './Player'
import PlayerStats from './PlayerStats'
import MatchScreen from './MatchScreen'

const TeamsStack = createNativeStackNavigator()

const TeamsScreen = props => {
  const navigation = useNavigation()
  return (
    <TeamsStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerRight: () => (
          <IconButton icon="menu" onPress={() => navigation.openDrawer()} />
        ),
      }}>
      <TeamsStack.Screen
        name="Root"
        component={TeamsHome}
        options={{
          title: 'Teams',
          headerLeft: () => (
            <IconButton
              icon="home"
              onPress={() => navigation.navigate('Upcoming Matches')}
            />
          ),
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
