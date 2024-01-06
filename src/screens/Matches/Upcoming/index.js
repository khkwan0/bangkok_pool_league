import React from 'react'
import MatchScreen from '@screens/Matches/MatchScreen'
import UpcomingMatches from './UpcomingMatches'
import Roster from '@screens/Matches/Roster'
import ExtendedMatchInfo from '@screens/Matches/ExtendedMatchInfo'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {View} from 'react-native'
import SettingsIcon from '@components/SettingsIcon'
import {useTranslation} from 'react-i18next'

const MatchStack = createNativeStackNavigator()

const Matches = props => {
  const {t} = useTranslation()

  return (
    <View style={{flex: 1}}>
      <MatchStack.Navigator
        screenOptions={{
          headerRight: SettingsIcon,
          headerTitle: t('upcoming_matches'),
        }}>
        <MatchStack.Screen
          name="Upcoming Matches"
          component={UpcomingMatches}
        />
        <MatchStack.Screen name="Match Screen" component={MatchScreen} />
        <MatchStack.Screen name="Roster" component={Roster} />
        <MatchStack.Screen name="Match Info" component={ExtendedMatchInfo} />
      </MatchStack.Navigator>
    </View>
  )
}

export default Matches
