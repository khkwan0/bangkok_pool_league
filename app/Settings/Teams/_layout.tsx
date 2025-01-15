import {Stack, useNavigation} from 'expo-router'
import {useTranslation} from 'react-i18next'
import {useEffect} from 'react'

export default function TeamsLayout() {
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({headerShown: false})
  }, [navigation])

  const {t} = useTranslation()
  return (
    <Stack screenOptions={{headerShown: true}}>
      <Stack.Screen
        name="index"
        options={{headerTitle: t('teams'), headerTitleAlign: 'center'}}
      />
      <Stack.Screen
        name="Team"
        options={{headerTitle: t('team'), headerTitleAlign: 'center'}}
      />
    </Stack>
  )
}
