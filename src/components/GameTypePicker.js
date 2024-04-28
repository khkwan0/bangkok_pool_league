import React from 'react'
import {Picker} from '@react-native-picker/picker'
import {useLeague, useYBase} from '~/lib/hooks'
import {Platform} from 'react-native'
import {Pressable, Row, Text} from '@ybase'
import AD from 'react-native-vector-icons/AntDesign'
import {useTranslation} from 'react-i18next'

const GameTypePicker = props => {
  const [open, setOpen] = React.useState(false)
  const [gameTypes, setGameTypes] = React.useState([])
  const league = useLeague()
  const {colors} = useYBase()
  const {t} = useTranslation()

  async function GetGameTypes() {
    try {
      const res = await league.GetGameTypes()
      setGameTypes(res.map(gt => gt.game_type))
    } catch (e) {
      console.log(e)
    }
  }
  React.useEffect(() => {
    GetGameTypes()
  }, [])

  if (gameTypes.length > 0) {
    if (Platform.OS === 'ios' && !open) {
      return (
        <Pressable onPress={() => setOpen(true)} py={10}>
          <Row alignItems="center" space={20}>
            <Text fontSize="lg">{gameTypes[0]}</Text>
            <AD name="caretdown" color={colors.onSurface} size={20} />
          </Row>
        </Pressable>
      )
    } else if (Platform.OS === 'android' || open) {
      return (
        <>
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setOpen(false)}>
              <Text textAlign="right">done</Text>
            </Pressable>
          )}
          <Picker
            dropdownIconColor={colors.onSurface}
            selectedValue={props.gameType}
            mode="dropdown"
            onValueChange={(itemValue, itemPosition) =>
              props.setGameType(itemValue)
            }>
            {gameTypes.map(_gt => (
              <Picker.Item
                color={colors.onSurface}
                style={{backgroundColor: colors.surface}}
                key={_gt}
                label={t('game_type') + ' ' + _gt}
                value={_gt}
              />
            ))}
          </Picker>
        </>
      )
    }
  } else {
    return null
  }
}

export default GameTypePicker
