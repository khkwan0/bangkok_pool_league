import {Stack} from 'expo-router'
import {useTranslation} from 'react-i18next'
import {SettingsButton} from '@/components/navigation/SettingsButton'

export default function TeamsLayout() {
  const {t} = useTranslation()
  return (
    <Stack
      screenOptions={{
        headerRight: () => <SettingsButton />,
      }}>
      <Stack.Screen
        name="index"
        options={{headerShown: true, title: t('teams')}}
      />
      <Stack.Screen
        name="mini-leagues/index"
        options={{headerShown: true, title: 'Mini Leagues'}}
      />
      <Stack.Screen
        name="mini-leagues/[id]/index"
        options={{headerShown: true, title: 'Mini League'}}
      />
    </Stack>
  )
}
