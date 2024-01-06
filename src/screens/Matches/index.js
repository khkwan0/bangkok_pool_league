import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import Upcoming from './Upcoming'
import Completed from './Completed'
import {useTranslation} from 'react-i18next'

const Tab = createBottomTabNavigator()
const Matches = props => {
  const {t} = useTranslation()

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Upcoming"
        component={Upcoming}
        options={{title: t('upcoming')}}
      />
      <Tab.Screen
        name="Completed"
        component={Completed}
        options={{title: t('completed')}}
      />
    </Tab.Navigator>
  )
}

export default Matches
