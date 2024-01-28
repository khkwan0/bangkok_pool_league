import React from 'react'
import Home from '@screens/Home'
import {useAccount, useLeague, useYBase} from '~/lib/hooks'
import '~/i18n'
import {useTranslation} from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {ActivityIndicator, View} from '@ybase'
import {AppState} from 'react-native'

const Main = props => {
  const account = useAccount()
  const league = useLeague()
  const [isMounted, setIsMounted] = React.useState(false)
  const {i18n} = useTranslation()
  const {colors, setColorMode} = useYBase()

  const appState = React.useRef(AppState.currentState)

  async function FetchUser() {
    try {
      console.log('fetch user')
      await account.FetchUser()
    } catch (e) {
      console.log(e)
    } finally {
      setIsMounted(true)
    }
  }

  React.useEffect(() => {
    FetchUser()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      const season = await league.GetSeason()
    })()
  }, [league])

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/background|active/) &&
        nextAppState === 'active'
      ) {
        FetchUser()
      }
      appState.current = nextAppState
    })
    return () => subscription.remove()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      try {
        const lang = await AsyncStorage.getItem('language')
        i18n.changeLanguage(lang ? lang : 'en')
        const storedColorMode = (await AsyncStorage.getItem('theme')) ?? 'light'
        setColorMode(storedColorMode)
      } catch (e) {
        console.log(e)
      }
    })()
    return () => setIsMounted(false)
  }, [])

  if (isMounted) {
    return (
      <View flex={1} bgColor={colors.background}>
        <Home />
      </View>
    )
  } else {
    ;<View flex={1} justifyContent="center" alignItems="center">
      <ActivityIndicator />
    </View>
  }
}

export default Main
