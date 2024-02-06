import React from 'react'
import {useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'
import {Pressable, TextInput, View} from '@ybase'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const PlayersHeader = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()
  return (
    <View px={20}>
      <TextInput
        placeholder={t('search')}
        value={props.searchQuery}
        onChangeText={text => props.setSearchQuery(text)}
        inputRightElement={
          <View mr={10}>
            <Pressable onPress={() => props.clearQuery()}>
              <MCI
                name="close-circle-outline"
                color={colors.onSurface}
                size={30}
              />
            </Pressable>
          </View>
        }
      />
    </View>
  )
}

export default PlayersHeader
