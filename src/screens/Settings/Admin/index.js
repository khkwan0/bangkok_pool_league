import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import Home from './Home'
import Teams from './Teams'
import Divisions from './Divisions'
import Leagues from './Leagues'
import Seasons from './Seasons'

const AdminStack = createStackNavigator()

const Admin = props => {
  return (
    <AdminStack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <AdminStack.Screen name="admin" component={Home} />
      <AdminStack.Screen name="admin_teams" component={Teams} />
      <AdminStack.Screen name="admin_seasons" component={Seasons} />
      <AdminStack.Screen name="admin_divisions" component={Divisions} />
      <AdminStack.Screen name="admin_leagues" component={Leagues} />
    </AdminStack.Navigator>
  )
}

export default Admin
