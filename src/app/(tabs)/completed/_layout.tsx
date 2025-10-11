import {Stack} from 'expo-router'
import {t} from 'i18next'
import {SettingsButton} from '@/components/navigation/SettingsButton'

export default function CompletedLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: t('Completed'),
          headerRight: () => <SettingsButton />,
        }}
      />
      <Stack.Screen
        name="match/index"
        options={{headerRight: () => <SettingsButton />}}
      />
    </Stack>
  )
}
