import {IconButton} from 'react-native-paper'
import {router} from 'expo-router'

export const SettingsButton = () => {
  return <IconButton icon="menu" onPress={() => router.push('/Settings')} />
}
