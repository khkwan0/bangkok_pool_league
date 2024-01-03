import React from 'react'
import MatchDetails from './MatchDetails'
import UpcomingMatches from './CompletedMatches'
import Roster from '@screens/Matches/Roster'
import ExtendedMatchInfo from '@screens/Matches/ExtendedMatchInfo'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import SettingsIcon from '@components/SettingsIcon'
import {useTranslation} from 'react-i18next'

const MatchStack = createNativeStackNavigator()

const Matches = props => {
  const insets = useSafeAreaInsets()
  const {t} = useTranslation()

  return (
    <View style={{flex: 1}}>
      <MatchStack.Navigator
        screenOptions={{
          headerRight: SettingsIcon,
          headerTitleAlign: 'center',
          headerTitle: t('completed_matches'),
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
      </MatchStack.Navigator>
    </View>
  )
}

export default Matches
