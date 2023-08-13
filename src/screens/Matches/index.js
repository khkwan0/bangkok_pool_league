import React from 'react'
import MatchScreen from './MatchScreen'
import UpcomingMatches from './UpcomingMatches'
import Roster from './Roster'
import ExtendedMatchInfo from './ExtendedMatchInfo'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {View} from 'react-native'
import {IconButton} from 'react-native-paper'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

const MatchStack = createNativeStackNavigator()

const Matches = props => {
  const insets = useSafeAreaInsets()

  return (
    <View style={{flex: 1, backgroundColor: 'blue', paddingTop: insets.top}}>
      <MatchStack.Navigator
        screenOptions={{
          // eslint-disable-next-line react/no-unstable-nested-components
          headerRight: () => {
            return (
              <IconButton
                icon="menu"
                onPress={() => props.navigation.openDrawer()}
              />
            )
          },
          headerTitleAlign: 'center',
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
