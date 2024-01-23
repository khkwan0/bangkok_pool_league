import React from 'react'
import RNPickerSelect from 'react-native-picker-select'
import {Picker} from '@react-native-picker/picker'
import {useLeague, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const SeasonPicker = props => {
  const [seasons, setSeasons] = React.useState([])
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

  return (
    <RNPickerSelect
      onValueChange={val => props.setSeason(val)}
      items={seasons.map(_season => ({
        label: `${t('season')} ${
          _season.identifier ? _season.identifier : _season.id
        } ${_season.name}`,
        value: _season.id,
        color: colors.onSurface,
      }))}
      value={props.season}
      dropdownIconColor={colors.onSurface}
      pickerProps={{dropdownIconColor: colors.onSurface}}
    />
  )
  /*
  return (
    <Picker
      dropdownIconColor={colors.onSurface}
      selectedValue={props.season}
      mode="dropdown"
      onValueChange={(itemValue, itemPosition) => props.setSeason(itemValue)}>
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
  */
}

export default SeasonPicker
