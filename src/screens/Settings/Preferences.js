import React from 'react'
import {Pressable, Row, Switch, Text, View} from '@ybase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'
import Feather from 'react-native-vector-icons/Feather'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useSelector} from 'react-redux'

const Preferences = props => {
  const [lang, setLang] = React.useState('en')
  const [isMounted, setIsMounted] = React.useState(false)
  const {i18n} = useTranslation()
  const {colors, colorMode, setColorMode} = useYBase()
  const user = useSelector(_state => _state.userData).user

  React.useEffect(() => {
    ;(async () => {
      try {
        const _lang = await AsyncStorage.getItem('language')
        setLang(_lang)
      } catch (e) {
        console.log(e)
      } finally {
        setIsMounted(true)
      }
    })()
  }, [])

  async function ToggleLanguage() {
    try {
      const newLang = lang === 'en' ? 'th' : 'en'
      AsyncStorage.setItem('language', newLang)
      setLang(newLang)
      i18n.changeLanguage(newLang)
    } catch (e) {
      console.log(e)
    }
  }

  async function ToggleColorMode() {
    try {
      const newColorMode = colorMode === 'light' ? 'dark' : 'light'
      setColorMode(newColorMode)
      AsyncStorage.setItem('theme', newColorMode)
    } catch (e) {
      console.log(e)
    }
  }

  if (isMounted) {
    return (
      <View flex={1} px={20} bgColor={colors.background}>
        <Row alignItems="center" mt={20}>
          <View flex={1}>
            <Text fontSize="lg" bold>
              Language/ภาษา
            </Text>
          </View>
          <View flex={1} alignItems="flex-end">
            <Row alignItems="center" space={10}>
              <Text>EN</Text>
              <Switch
                value={lang === 'th' ? true : false}
                onChange={() => ToggleLanguage()}
              />
              <Text>TH</Text>
            </Row>
          </View>
        </Row>
        <Row alignItems="center" mt={20}>
          <View flex={1}>
            <Text fontSize="lg" bold>
              theme
            </Text>
          </View>
          <View flex={1} alignItems="flex-end">
            <Row alignItems="center" space={10}>
              <Feather name="sun" color={colors.onSurface} size={20} />
              <Switch
                value={colorMode === 'dark' ? true : false}
                onChange={() => ToggleColorMode()}
              />
              <MCI name="weather-night" color={colors.onSurface} size={20} />
            </Row>
          </View>
        </Row>
        {typeof user.id !== 'undefined' && (
          <Pressable
            onPress={() => props.navigation.navigate('Delete Account')}>
            <Row alignItesm="center" mt={20}>
              <View flex={1}>
                <Text color={colors.error} fontSize="lg" bold>
                  delete_account
                </Text>
              </View>
              <View flex={1} alignItems="flex-end">
                <MCI name="chevron-right" color={colors.error} size={30} />
              </View>
            </Row>
          </Pressable>
        )}
      </View>
    )
  } else {
    return null
  }
}

export default Preferences
