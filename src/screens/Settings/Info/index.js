import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import {useTranslation} from 'react-i18next'
import InfoHome from './Home'
import PrivacyPolicy from './PrivacyPolicy'
import {useYBase} from '~/lib/hooks'
import NineBallRules from './NineBallRules'
import EightBallRules from './EightBallRules'

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
      <InfoStack.Screen
        component={NineBallRules}
        name="Nine Ball Rules"
        options={{headerTitle: '9-Ball Rules'}}
      />
      <InfoStack.Screen
        component={EightBallRules}
        name="Eight Ball Rules"
        options={{headerTitle: '8-Ball Rules'}}
      />
    </InfoStack.Navigator>
  )
}

export default Info
