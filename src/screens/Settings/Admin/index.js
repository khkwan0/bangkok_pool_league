import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import Home from './Home'
import Teams from './Teams'
import AdminLogin from './AdminLogin'
import Divisions from './Divisions'
import Leagues from './Leagues'
import TeamMigrations from './TeamMigrations'
import Seasons from './Seasons'
import {useYBase} from '~/lib/hooks'
import {View} from '@ybase'

const AdminStack = createStackNavigator()

const Admin = props => {
  const {colors} = useYBase()
  return (
    <View flex={1} bgColor={colors.background}>
      <AdminStack.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {backgroundColor: colors.background},
          headerTitleStyle: {color: colors.onHeaderBackground},
          headerTintColor: colors.onHeaderBackground,
        }}>
        <AdminStack.Screen name="admin" component={Home} />
        <AdminStack.Screen name="admin_teams" component={Teams} />
        <AdminStack.Screen name="admin_seasons" component={Seasons} />
        <AdminStack.Screen name="admin_divisions" component={Divisions} />
        <AdminStack.Screen name="admin_leagues" component={Leagues} />
        <AdminStack.Screen
          name="admin_team_migrations"
          component={TeamMigrations}
        />
        <AdminStack.Screen name="admin_login" component={AdminLogin} />
      </AdminStack.Navigator>
    </View>
  )
}

export default Admin
