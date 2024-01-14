import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import Home from './Home'
import Teams from './Teams'
import Divisions from './Divisions'
import Leagues from './Leagues'
import Seasons from './Seasons'
import NewSeason from './Seasons/NewSeason'
import NewSeasonSuccess from './Seasons/NewSeasonSuccess'

const AdminStack = createStackNavigator()

const Admin = props => {
  return (
    <AdminStack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <AdminStack.Screen name="admin" component={Home} />
      <AdminStack.Screen name="admin_teams" component={Teams} />
      <AdminStack.Screen name="admin_seasons" component={Seasons} />
      <AdminStack.Screen name="admin_seasons_new" component={NewSeason} />
      <AdminStack.Screen
        name="admin_seasons_new_success"
        component={NewSeasonSuccess}
        options={{
          headerBackTitleVisible: false,
          headerLeft: null,
          gestureEnabled: false,
        }}
      />
      <AdminStack.Screen name="admin_divisions" component={Divisions} />
      <AdminStack.Screen name="admin_leagues" component={Leagues} />
    </AdminStack.Navigator>
  )
}

export default Admin
