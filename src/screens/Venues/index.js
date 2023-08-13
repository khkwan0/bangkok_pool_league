/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import VenuesHome from './VenuesHome'
import Venue from './Venue'
import Team from './Team'
import {IconButton} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'
import Player from './Player'

const VenueStack = createNativeStackNavigator()

const VenuesNav = props => {
  const navigation = useNavigation()
  return (
    <VenueStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerRight: () => (
          <IconButton icon="menu" onPress={() => navigation.openDrawer()} />
        ),
      }}>
      <VenueStack.Screen
        name="Root"
        component={VenuesHome}
        options={{
          title: 'Venues',
          headerLeft: () => (
            <IconButton
              icon="home"
              onPress={() => navigation.navigate('Upcoming Matches')}
            />
          ),
        }}
      />
      <VenueStack.Screen name="Venue" component={Venue} />
      <VenueStack.Screen
        name="Team"
        component={Team}
        option={{title: 'Team'}}
      />
      <VenueStack.Screen
        name="Player"
        component={Player}
        option={{title: 'Player'}}
      />
    </VenueStack.Navigator>
  )
}

export default VenuesNav
