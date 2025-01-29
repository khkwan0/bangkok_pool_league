import {LeagueProvider} from '@/context/LeagueContext'
import * as SplashScreen from 'expo-splash-screen'
import {useFonts} from 'expo-font'
import {useEffect} from 'react'
import {MatchProvider} from '@/context/MatchContext'
import {Stack} from 'expo-router'
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native'
import {Appearance, useColorScheme, PermissionsAndroid, Platform} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import '@/i18n'
import '../../global.css'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  useEffect(() => {
    ;(async () => {
      const savedColorScheme = await AsyncStorage.getItem('theme')
      if (!savedColorScheme) {
        Appearance.setColorScheme(null)
      } else {
        Appearance.setColorScheme(savedColorScheme as ColorSchemeName)
      }
    })()
  }, [])

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LeagueProvider>
        <MatchProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
          </Stack>
        </MatchProvider>
      </LeagueProvider>
    </ThemeProvider>
  )
}
