/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
import {useAccount, useLeague} from '~/lib/hooks'
import {useAppSelector} from '~/lib/hooks/redux'
import Matches from '@screens/Matches'
import Calendar from '@screens/Calendar'
import Login from '@screens/Auth/Login'
import Account from '@screens/Account'
import Divisions from '@screens/Divisions'
import Teams from '@screens/Teams'
import Venues from '@screens/Venues'
import Players from '@screens/Players'
import Seasons from '@screens/Seasons'
import Schedules from '@screens/Schedules'
import Statistics from '@screens/Statistics'
import Info from '@screens/Info'
import Settings from '@screens/Settings'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createDrawerNavigator} from '@react-navigation/drawer'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import DrawerContent from '@components/DrawerContent'
import {IconButton} from 'react-native-paper'

const Tab = createBottomTabNavigator()
const Drawer = createDrawerNavigator()

const Main = props => {
  const account = useAccount()
  const league = useLeague()
  const [drawerOnly, setDrawerOnly] = React.useState(true)

  const {user} = useAppSelector(_state => _state.user)

  React.useEffect(() => {
    account.FetchUser()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      const season = await league.GetSeason()
    })()
  }, [league])

  if (drawerOnly) {
    return (
      <Drawer.Navigator
        drawerContent={params => <DrawerContent {...params} />}
        screenOptions={({navigation}) => ({
          drawerPosition: 'right',
          headerTitleAlign: 'center',
          headerLeft: () => null,
          headerRight: () => 
            <IconButton
              icon="menu"
              onPress={() => navigation.openDrawer()}
            />
        })}>
        <Drawer.Screen
          name="Matches"
          component={Matches}
          options={{headerShown: false}}
        />
        <Drawer.Screen name="Login" component={Login} />
        <Drawer.Screen name="Divisions" component={Divisions} />
        <Drawer.Screen name="Venues" component={Venues} options={{headerShown: false}} />
        <Drawer.Screen name="Teams" component={Teams} options={{headerShown: false}} />
        <Drawer.Screen name="Players" component={Players} options={{headerShown: false}} />
        <Drawer.Screen name="Calendar" component={Calendar} />
        <Drawer.Screen name="Schedules" component={Schedules} />
        <Drawer.Screen name="Seasons" component={Seasons} />
        <Drawer.Screen name="Statistics" component={Statistics} options={{headerShown: false}} />
        <Drawer.Screen name="Info" component={Info} />
        <Drawer.Screen name="Settings" component={Settings} />
      </Drawer.Navigator>
    )
  } else {
    return (
      <Tab.Navigator
        screenOptions={{
          lazy: false,
          headerShown: false,
        }}>
        <Tab.Screen
          name="Matches"
          component={Matches}
          options={{
            tabBarLabel: 'Matches',
            tabBarIcon: ({color, size}) => {
              return (
                <MaterialCommunityIcons
                  name="billiards-rack"
                  size={size}
                  color={color}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={Calendar}
          options={{
            tabBarIcon: ({color, size}) => {
              return (
                <MaterialCommunityIcons
                  name="calendar"
                  size={size}
                  color={color}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name="Me"
          component={Account}
          options={{
            tabBarIcon: ({color, size}) => {
              return (
                <MaterialCommunityIcons
                  name="head-dots-horizontal"
                  size={size}
                  color={color}
                />
              )
            },
          }}
        />
      </Tab.Navigator>
    )
  }
}

export default Main
