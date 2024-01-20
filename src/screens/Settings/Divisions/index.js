import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import DivisionsHome from './DivisionsHome'
import Team from './Team'
import Player from './Player'
import PlayerStats from './PlayerStats'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'

const DivisionStack = createStackNavigator()

const Divisions = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()

  return (
    <DivisionStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: colors.onHeaderBackground,
        headerTitleAlign: 'center',
      }}>
      <DivisionStack.Screen
        name="Root"
        component={DivisionsHome}
        options={{
          title: t('divisions'),
        }}
      />
      <DivisionStack.Screen name="Team" component={Team} />
      <DivisionStack.Screen name="Player" component={Player} />
      <DivisionStack.Screen name="Player Statistics" component={PlayerStats} />
    </DivisionStack.Navigator>
  )
}

export default Divisions
