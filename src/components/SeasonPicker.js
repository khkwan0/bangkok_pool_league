import React from 'react'
import {Picker} from '@react-native-picker/picker'
import {useLeague, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'
import {Platform} from 'react-native'
import {Pressable, Row, Text} from '@ybase'
import AD from 'react-native-vector-icons/AntDesign'

const SeasonPicker = props => {
  const [seasons, setSeasons] = React.useState([])
  const [open, setOpen] = React.useState(false)
  const [season, setSeason] = React.useState(11)
  const league = useLeague()
  const {t} = useTranslation()
  const {colors} = useYBase()

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await league.GetSeasons()
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          setSeasons(res.data)
        }
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  const __season = seasons.find(s => s.id === season)

  if (__season) {
    if (Platform.OS === 'ios' && !open) {
      return (
        <Pressable onPress={() => setOpen(true)} py={10}>
          <Row alignItems="center" space={20}>
            <Text fontSize="lg">
              {t('season')}{' '}
              {season.identifier ? __season.identifier : __season.id}{' '}
              {__season.name}
            </Text>
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
            selectedValue={props.season}
            mode="dropdown"
            onValueChange={(itemValue, itemPosition) =>
              props.setSeason(itemValue)
            }>
            {seasons.map(_season => (
              <Picker.Item
                color={colors.onSurface}
                style={{backgroundColor: colors.surface}}
                key={_season.id}
                label={
                  t('season') +
                  ' ' +
                  (_season.identifier
                    ? _season.identifier
                    : _season.id + ' ' + _season.name)
                }
                value={_season.id}
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

export default SeasonPicker
