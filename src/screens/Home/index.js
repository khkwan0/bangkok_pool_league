import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import Matches from '@screens/Matches'
import Settings from '@screens/Settings'
import Calendar from '@screens/Settings/Calendar'
import Login from '@screens/Auth'
import Account from '@screens/Settings/Account'
import Divisions from '@screens/Settings/Divisions'
import Teams from '@screens/Settings/Teams'
import Venues from '@screens/Settings/Venues'
import Players from '@screens/Settings/Players'
import Seasons from '@screens/Settings/Seasons'
import Schedules from '@screens/Settings/Schedules'
import Statistics from '@screens/Settings/Statistics'
import Info from '@screens/Settings/Info'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'
import Preferences from '@screens/Settings/Preferences'

const HomeStack = createNativeStackNavigator()

const Home = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: {color: colors.onHeaderBackground},
        headerTitleAlign: 'center',
      }}>
      <HomeStack.Screen
        component={Matches}
        name="Matches"
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        options={{headerTitle: t('settings')}}
        component={Settings}
        name="Settings"
      />
      <HomeStack.Screen
        options={{headerTitle: t('statistics')}}
        component={Statistics}
        name="Statistics"
      />
      <HomeStack.Screen
        options={{headerTitle: t('info_and_guides')}}
        component={Info}
        name="Info"
      />
      <HomeStack.Screen
        options={{headerTitle: t('schedules')}}
        component={Schedules}
        name="Schedules"
      />
      <HomeStack.Screen
        options={{headerTitle: t('seasons')}}
        component={Seasons}
        name="Seasons"
      />
      <HomeStack.Screen
        options={{headerTitle: t('players')}}
        component={Players}
        name="Players"
      />
      <HomeStack.Screen
        options={{headerTitle: t('venues')}}
        component={Venues}
        name="Venues"
      />
      <HomeStack.Screen
        options={{headerShown: false}}
        component={Teams}
        name="Teams"
      />
      <HomeStack.Screen
        options={{headerTitle: t('divisions')}}
        component={Divisions}
        name="Divisions"
      />
      <HomeStack.Screen
        options={{headerTitle: t('account')}}
        component={Account}
        name="Account"
      />
      <HomeStack.Screen
        options={{headerTitle: t('calendar')}}
        component={Calendar}
        name="Calendar"
      />
      <HomeStack.Screen
        component={Preferences}
        name="Preferences"
        options={{headerTitle: t('preferences')}}
      />
      <HomeStack.Screen component={Login} name="Login" options={{headerShown: false}} />
    </HomeStack.Navigator>
  )
}

export default Home