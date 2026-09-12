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
    </Stack>
  )
}
