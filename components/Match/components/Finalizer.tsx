import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import Row from '@/components/Row'
import {Pressable, useColorScheme} from 'react-native'
import {t} from 'i18next'

export default function Finalizer() {
  const colorScheme = useColorScheme()

  const backgroundTint = colorScheme === 'dark' ? '600' : '300'
  const red = `bg-red-${backgroundTint}`
  const blue = `bg-blue-${backgroundTint}`
  const homeStyle = `${red} mx-4 p-4 item-center rounded`
  const awayStyle = `${blue} mx-4 p-4 item-center rounded`

  return (
    <View>
      <Row>
        <View flex={1}>
          <Pressable className={homeStyle}>
            <Text textAlign="center" type="subtitle">
              {t('finalize')} {t('home')}
            </Text>
          </Pressable>
        </View>
        <View flex={1}>
          <Pressable className={awayStyle}>
            <Text textAlign="center" type="subtitle">
              {t('finalize')} {t('away')}
            </Text>
          </Pressable>
        </View>
      </Row>
    </View>
  )
}
