import React from 'react'
import RNPickerSelect from 'react-native-picker-select'
import {Picker} from '@react-native-picker/picker'
import {useLeague, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'
import {Platform} from 'react-native'
import {Pressable, Row, Text} from '@ybase'

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
        <Pressable onPress={() => setOpen(true)}>
          <Row alignItems="center">
            <Text>
              {t('season')}{' '}
              {season.identifier ? __season.identifier : __season.id}{' '}
              {__season.name}
            </Text>
          </Row>
        </Pressable>
      )
    } else if (Platform.OS === 'android' || open) {
      return (
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
      )
    }
  } else {
    return null
  }
}

export default SeasonPicker
