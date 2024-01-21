import React from 'react'
import MatchScreen from '@screens/Matches/MatchScreen'
import UpcomingMatches from './UpcomingMatches'
import Roster from '@screens/Matches/Roster'
import ExtendedMatchInfo from '@screens/Matches/ExtendedMatchInfo'
//import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createStackNavigator} from '@react-navigation/stack'
import SettingsIcon from '@components/SettingsIcon'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'

const MatchStack = createStackNavigator()

const Matches = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()

  return (
    <MatchStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: colors.onHeaderBackground,
        headerRight: SettingsIcon,
        headerTitleAlign: 'center',
        headerTitle: t('upcoming_matches'),
        presentation: 'transparentModal',
      }}>
      <MatchStack.Screen name="Upcoming Matches" component={UpcomingMatches} />
      <MatchStack.Screen name="Match Screen" component={MatchScreen} />
      <MatchStack.Screen
        name="Roster"
        component={Roster}
        options={{headerTitle: t('roster')}}
      />
      <MatchStack.Screen
        name="Match Info"
        component={ExtendedMatchInfo}
        options={{headerTitle: t('match_info')}}
      />
    </MatchStack.Navigator>
  )
}

export default Matches
