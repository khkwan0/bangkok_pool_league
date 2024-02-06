import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import PlayersHome from './PlayersHome'
import PlayerDetails from './PlayerDetails'

const AdminPlayersStack = createStackNavigator()

const AdminPlayers = props => {
  return (
    <AdminPlayersStack.Navigator>
      <AdminPlayersStack.Screen
        name="Admin Players"
        component={PlayersHome}
        options={{headerShown: false}}
      />
      <AdminPlayersStack.Screen
        name="Admin Player"
        component={PlayerDetails}
        options={{headerShown: false}}
      />
    </AdminPlayersStack.Navigator>
  )
}

export default AdminPlayers
