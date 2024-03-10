import React from 'react'
import {useYBase} from '~/lib/hooks'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {Linking, Platform} from 'react-native'
import {Pressable, Row, Text, View} from '@ybase'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const NeedUpdate = props => {
  const {colors} = useYBase()
  const [acknowledged, setAcknowledged] = React.useState(false)
  const insets = useSafeAreaInsets()

  async function HandleUpdate() {
    try {
      setAcknowledged(true)
      const url =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/us/app/bangkok-pool-league/id6447631894'
          : 'https://play.google.com/store/apps/details?id=com.bangkok_pool_league'
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      }
    } catch (e) {
      console.log(e)
    }
  }

  if (!acknowledged && props.needsUpdate) {
    return (
      <Row alignItems="center" pt={insets.top}>
        <View flex={1} />
        <View flex={2}>
          <Pressable
            py={10}
            bgColor={colors.error}
            onPress={() => HandleUpdate()}>
            <Text bold textAlign="center">
              A new version is available.
            </Text>
          </Pressable>
        </View>
        <View flex={1} alignItems="flex-end">
          <Pressable pr={20} onPress={() => setAcknowledged(true)}>
            <MCI name="close" size={20} />
          </Pressable>
        </View>
      </Row>
    )
  } else {
    return null
  }
}

export default NeedUpdate
