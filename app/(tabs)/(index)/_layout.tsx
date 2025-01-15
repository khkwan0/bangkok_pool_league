import {Stack} from 'expo-router'
import {useTranslation} from 'react-i18next'
import {SettingsButton} from '@/components/navigation/SettingsButton'
export default function MatchLayout() {
  const {t} = useTranslation()
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerRight: () => <SettingsButton />,
          headerTitle: t('bangkok_pool_league'),
        }}
      />
    </Stack>
  )
}
