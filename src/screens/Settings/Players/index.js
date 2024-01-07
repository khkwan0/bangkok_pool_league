/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import PlayersHome from './PlayersHome'
import Player from './Player'
import PlayerStats from './PlayerStats'
import MatchScreen from './MatchScreen'
import {IconButton} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'

const PlayersStack = createNativeStackNavigator()

const PlayersScreen = props => {
  const navigation = useNavigation()
  return (
    <PlayersStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerRight: () => (
          <IconButton icon="menu" onPress={() => navigation.openDrawer()} />
        ),
      }}>
      <PlayersStack.Screen
        name="Root"
        component={PlayersHome}
        options={{
          title: 'Players',
          headerLeft: () => (
            <IconButton
              icon="home"
              onPress={() => navigation.navigate('Upcoming Matches')}
            />
          ),
        }}
      />
      <PlayersStack.Screen name="Player" component={Player} />
      <PlayersStack.Screen name="Player Statistics" component={PlayerStats} />
      <PlayersStack.Screen name="Player Match Screen" component={MatchScreen} />
    </PlayersStack.Navigator>
  )
}

export default PlayersScreen
