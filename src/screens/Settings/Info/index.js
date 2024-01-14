import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {useTranslation} from 'react-i18next'
import InfoHome from './Home'
import PrivacyPolicy from './PrivacyPolicy'
import {useYBase} from '~/lib/hooks'

const InfoStack = createStackNavigator()

const Info = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()

  return (
    <InfoStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: {backgroundColor: colors.headerBackground},
        headerTitleStyle: {color: colors.onHeaderBackground},
        headerTintColor: colors.onHeaderBackground,
      }}>
      <InfoStack.Screen
        component={InfoHome}
        name="Info Home"
        options={{headerTitle: t('info_and_guides')}}
      />
      <InfoStack.Screen
        component={PrivacyPolicy}
        name="Privacy Policy"
        options={{headerTitle: t('privacy_policy')}}
      />
    </InfoStack.Navigator>
  )
}

export default Info
