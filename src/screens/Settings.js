import React from 'react'
import {Row, Switch, Text, View} from '@ybase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useTranslation} from 'react-i18next'

const Settings = props => {
  const [lang, setLang] = React.useState('en')
  const [isMounted, setIsMounted] = React.useState(false)
  const {i18n} = useTranslation()

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

  if (isMounted) {
    return (
      <View px={20}>
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
      </View>
    )
  } else {
    return null
  }
}

export default Settings
