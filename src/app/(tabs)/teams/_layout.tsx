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
      <Stack.Screen
        name="mini-leagues/[id]/players"
        options={{headerShown: true, title: 'Players'}}
      />
      <Stack.Screen
        name="mini-leagues/[id]/teams"
        options={{headerShown: true, title: 'Teams'}}
      />
      <Stack.Screen
        name="mini-leagues/[id]/create-match"
        options={{headerShown: true, title: 'Create match'}}
      />
      <Stack.Screen
        name="mini-leagues/[id]/copy"
        options={{headerShown: true, title: 'Add from league'}}
      />
      <Stack.Screen
        name="mini-leagues/[id]/settings"
        options={{headerShown: true, title: 'Settings'}}
      />
    </Stack>
  )
}
