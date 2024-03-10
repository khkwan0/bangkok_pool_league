import React from 'react'
// import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createStackNavigator} from '@react-navigation/stack'
import Matches from '@screens/Matches'
import Admin from '@screens/Settings/Admin'
import Settings from '@screens/Settings'
import Calendar from '@screens/Settings/Calendar'
import Login from '@screens/Auth'
import Account from '@screens/Settings/Account'
import Divisions from '@screens/Settings/Divisions'
import Teams from '@screens/Settings/Teams'
import DeleteAccount from '@screens/Settings/DeleteAccount'
import Venues from '@screens/Settings/Venues'
import Players from '@screens/Settings/Players'
import AvatarPicker from '@screens/Settings/AvatarPicker'
import Profile from '@screens/Settings/Profile'
import Seasons from '@screens/Settings/Seasons'
import Schedules from '@screens/Settings/Schedules'

import StatisticsHome from '@screens/Settings/Statistics/StatisticsHome'
import LeagueStandings from '@screens/Settings/Statistics/LeagueStandings'
import StatisticsMatchScreen from '@screens/Settings/Statistics/MatchScreen'
import TeamStatistics from '@screens/Settings/Statistics/TeamStatistics'
import PlayerStatisticsMenu from '@screens/Settings/Statistics/PlayerStatisticsMenu'
import PlayerStatistics from '@screens/Settings/Statistics/PlayerStatistics'
import TeamInternal from '@screens/Settings/Statistics/TeamInternal'

import Team from '@screens/Team'

import Info from '@screens/Settings/Info'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'
import Preferences from '@screens/Settings/Preferences'
import LineSuccess from '@screens/Auth/LineSuccess'
import {View} from '@ybase'

const HomeStack = createStackNavigator()

const Home = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()

  return (
    <View flex={1} bgColor={colors.backgroundColor}>
      <HomeStack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.headerBackground},
          headerTitleStyle: {color: colors.onHeaderBackground},
          headerTintColor: colors.onHeaderBackground,
          headerTitleAlign: 'center',
          //  presentation: 'transparentModal',
        }}>
        <HomeStack.Screen
          component={Matches}
          name="Matches"
          options={{headerShown: false}}
        />
        <HomeStack.Screen
          options={{headerTitle: t('bangkok_pool_league')}}
          component={Settings}
          name="Settings"
        />
        <HomeStack.Screen
          name="StatisticsHome"
          component={StatisticsHome}
          options={{headerTitle: t('statistics')}}
        />
        <HomeStack.Screen name="League Standings" component={LeagueStandings} />
        <HomeStack.Screen
          name="Statistics Match Screen"
          component={StatisticsMatchScreen}
        />
        <HomeStack.Screen name="Team Statistics" component={TeamStatistics} />
        <HomeStack.Screen
          name="Player Statistics"
          component={PlayerStatistics}
        />
        <HomeStack.Screen
          name="Team Internal"
          options={{headerTitle: t('statistics')}}
          component={TeamInternal}
        />
        <HomeStack.Screen
          name="Player Statistics Menu"
          options={{headerTitle: t('statistics')}}
          component={PlayerStatisticsMenu}
        />
        <HomeStack.Screen
          options={{headerTitle: t('info_and_guides'), headerShown: false}}
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
          options={{headerTitle: t('avatar')}}
          component={AvatarPicker}
          name="Avatar"
        />
        <HomeStack.Screen
          options={{headerShown: false}}
          component={Players}
          name="Players"
        />
        <HomeStack.Screen
          component={Profile}
          name="Profile"
          options={{headerShown: false}}
        />
        <HomeStack.Screen
          options={{headerShown: false}}
          component={Venues}
          name="Venues"
        />
        <HomeStack.Screen
          options={{headerShown: false}}
          component={Teams}
          name="Teams"
        />
        <HomeStack.Screen component={Team} name="Team" />
        <HomeStack.Screen
          options={{headerTitle: t('divisions'), headerShown: false}}
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
        <HomeStack.Screen
          component={Admin}
          name="Admin"
          options={{headerTitle: t('admin'), headerShown: false}}
        />
        <HomeStack.Screen
          component={Login}
          name="Login"
          options={{headerShown: false, gestureEnabled: false}}
        />
        <HomeStack.Screen
          component={LineSuccess}
          name="LineSuccess"
          options={{headerShown: false}}
        />
        <HomeStack.Screen
          component={DeleteAccount}
          name="Delete Account"
          options={{headerShown: false}}
        />
      </HomeStack.Navigator>
    </View>
  )
}

export default Home
