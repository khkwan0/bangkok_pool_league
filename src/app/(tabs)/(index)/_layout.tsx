import {Stack} from 'expo-router'
import {CompetitionSwitcher} from '@/components/navigation/CompetitionSwitcher'
import {SettingsButton} from '@/components/navigation/SettingsButton'

export default function MatchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerRight: () => <SettingsButton />,
          headerTitle: () => <CompetitionSwitcher />,
        }}
      />
      <Stack.Screen
        name="Match/index"
        options={{headerRight: () => <SettingsButton />}}
      />
      <Stack.Screen
        name="PostponeScreen/index"
        options={{headerRight: () => <SettingsButton />}}
      />
      <Stack.Screen
        name="cups/index"
        options={{
          title: 'Cups',
          headerRight: () => <SettingsButton />,
        }}
      />
      <Stack.Screen
        name="cups/[id]"
        options={{
          title: 'Cup bracket',
          headerRight: () => <SettingsButton />,
        }}
      />
      <Stack.Screen
        name="cups/manage/index"
        options={{
          title: 'Manage cups',
          headerRight: () => <SettingsButton />,
        }}
      />
      <Stack.Screen
        name="cups/manage/create"
        options={{
          title: 'Create cup',
          headerRight: () => <SettingsButton />,
        }}
      />
      <Stack.Screen
        name="cups/manage/[tournamentId]"
        options={{
          title: 'Cup admin',
          headerRight: () => <SettingsButton />,
        }}
      />
    </Stack>
  )
}
