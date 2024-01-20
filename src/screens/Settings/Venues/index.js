/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
// import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createStackNavigator} from '@react-navigation/stack'
import VenuesHome from './VenuesHome'
import Venue from './Venue'
import Team from './Team'
import Player from './Player'
import PlayerStats from './PlayerStats'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'

// const VenueStack = createNativeStackNavigator()
const VenueStack = createStackNavigator()

const VenuesNav = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  return (
    <VenueStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: colors.onHeaderBackground,
        headerTitleAlign: 'center',
      }}>
      <VenueStack.Screen
        name="Root"
        component={VenuesHome}
        options={{
          title: t('venues'),
        }}
      />
      <VenueStack.Screen name="Venue" component={Venue} />
      <VenueStack.Screen
        name="Team"
        component={Team}
        option={{title: 'Team'}}
      />
      <VenueStack.Screen
        name="Player"
        component={Player}
        option={{title: 'Player'}}
      />
      <VenueStack.Screen name="Player Statistics" component={PlayerStats} />
    </VenueStack.Navigator>
  )
}

export default VenuesNav
