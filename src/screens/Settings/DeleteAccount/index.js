import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import DeleteAccountHome from './Home'
import DeleteAccountSuccess from './Success'
import {useTranslation} from 'react-i18next'

const DeleteAccountStack = createStackNavigator()

const DeleteAccount = props => {
  const {t} = useTranslation()
  return (
    <DeleteAccountStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitle: t('delete_account'),
      }}>
      <DeleteAccountStack.Screen
        name="Delete Account Request"
        component={DeleteAccountHome}
      />
      <DeleteAccountStack.Screen
        name="Delete Success"
        component={DeleteAccountSuccess}
      />
    </DeleteAccountStack.Navigator>
  )
}

export default DeleteAccount
