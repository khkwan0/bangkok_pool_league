/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import Upcoming from './Upcoming'
import Completed from './Completed'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useYBase} from '~/lib/hooks'
import {View} from '@ybase'

const Tab = createBottomTabNavigator()
const Matches = props => {
  const {t} = useTranslation()
  const {colors, colorMode} = useYBase()

  return (
    <View flex={1} bgColor={colors.background}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: {fontSize: 16},
        }}>
        <Tab.Screen
          name="Upcoming"
          component={Upcoming}
          options={{
            title: t('upcoming'),
            tabBarActiveBackgroundColor: colors.surface,
            tabBarInactiveBackgroundColor: colors.surface,
            tabBarIcon: () => (
              <MCI name="calendar" size={20} color={colors.onSurface} />
            ),
          }}
        />
        <Tab.Screen
          name="Completed"
          component={Completed}
          options={{
            title: t('completed'),
            tabBarActiveBackgroundColor: colors.surface,
            tabBarInactiveBackgroundColor: colors.surface,
            tabBarIcon: () => (
              <MCI name="check-circle" size={20} color={colors.onSurface} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  )
}

export default Matches
