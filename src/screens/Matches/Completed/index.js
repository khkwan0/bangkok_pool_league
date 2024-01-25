import React from 'react'
import MatchDetails from './MatchDetails'
import UpcomingMatches from './CompletedMatches'
import Roster from '@screens/Matches/Roster'
import MatchScreen from '../MatchScreen'
import ExtendedMatchInfo from '@screens/Matches/ExtendedMatchInfo'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createStackNavigator} from '@react-navigation/stack'
import {View} from '@ybase'
import SettingsIcon from '@components/SettingsIcon'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'

// const MatchStack = createNativeStackNavigator()
const MatchStack = createStackNavigator()

const Matches = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()

  return (
    <View flex={1} bgColor={colors.backgroundColor}>
      <MatchStack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.headerBackground},
          headerTitleStyle: {color: colors.onHeaderBackground},
          headerRight: SettingsIcon,
          headerTitleAlign: 'center',
          headerTitle: t('completed_matches'),
          headerTintColor: colors.onHeaderBackground,
          cardStyle: {backgroundColor: colors.background},
        }}>
        <MatchStack.Screen
          name="Upcoming Matches"
          component={UpcomingMatches}
        />
        <MatchStack.Screen
          name="Match Details"
          component={MatchDetails}
          options={{headerTitle: t('match_details')}}
        />
        <MatchStack.Screen name="Roster" component={Roster} />
        <MatchStack.Screen name="Match Info" component={ExtendedMatchInfo} />
        <MatchStack.Screen name="Post Match Screen" component={MatchScreen} />
      </MatchStack.Navigator>
    </View>
  )
}

export default Matches
