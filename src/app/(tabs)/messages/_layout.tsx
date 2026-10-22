import {Stack} from 'expo-router'
import {useStackContentSafeStyle} from '@/hooks/useStackContentSafeStyle'
import {useTranslation} from 'react-i18next'
import {SettingsButton} from '@/components/navigation/SettingsButton'

export default function MessagesLayout() {
  const {t} = useTranslation()
  const contentStyle = useStackContentSafeStyle()
  return (
    <Stack
      screenOptions={{
        headerRight: () => <SettingsButton />,
        contentStyle,
      }}>
      <Stack.Screen
        name="index"
        options={{headerShown: true, title: t('messages')}}
      />
      <Stack.Screen
        name="[playerId]/index"
        options={{headerShown: true, title: t('messages')}}
      />
      <Stack.Screen
        name="threadId/index"
        options={{headerShown: true, title: t('messages')}}
      />
    </Stack>
  )
}

