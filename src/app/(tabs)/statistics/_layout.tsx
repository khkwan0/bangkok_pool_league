import {Stack} from 'expo-router'
import {t} from 'i18next'
import {SettingsButton} from '@/components/navigation/SettingsButton'

export default function StatisticsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: t('statistics'),
          headerRight: () => <SettingsButton />,
        }}
      />
    </Stack>
  )
}
