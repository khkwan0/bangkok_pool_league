import React from 'react'
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
}

export default SeasonPicker
