import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import Upcoming from './Upcoming'
import Completed from './Completed'
import {useTranslation} from 'react-i18next'
import SettingsIcon from '@components/SettingsIcon'

const Tab = createBottomTabNavigator()
const Matches = props => {
  const {t} = useTranslation()

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Upcoming" component={Upcoming} />
      <Tab.Screen name="Completed" component={Completed} />
    </Tab.Navigator>
  )
}

export default Matches
