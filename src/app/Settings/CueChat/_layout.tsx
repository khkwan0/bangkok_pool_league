import {Stack} from 'expo-router'
import {SettingsButton} from '@/components/navigation/SettingsButton'

export default function CueChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: 'CueChat',
          headerRight: () => <SettingsButton />,
        }}
      />
    </Stack>
  )
}

