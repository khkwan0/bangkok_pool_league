/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import Upcoming from './Upcoming'
import Completed from './Completed'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const Tab = createBottomTabNavigator()
const Matches = props => {
  const {t} = useTranslation()

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Upcoming"
        component={Upcoming}
        options={{
          title: t('upcoming'),
          tabBarIcon: () => <MCI name="calendar" size={20} color="black" />,
        }}
      />
      <Tab.Screen
        name="Completed"
        component={Completed}
        options={{
          title: t('completed'),
          tabBarIcon: () => <MCI name="check-circle" size={20} color="black" />,
        }}
      />
    </Tab.Navigator>
  )
}

export default Matches
