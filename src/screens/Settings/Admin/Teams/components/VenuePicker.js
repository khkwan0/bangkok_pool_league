import React from 'react'
import {Picker} from '@react-native-picker/picker'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'

const VenuePicker = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const venues = props.venues

  if (venues.length > 0) {
    return (
      <Picker
        dropdownIconColor={colors.onSurface}
        selectedValue={props.venue}
        mode="dropdown"
        onValueChange={(itemValue, itemPosition) => props.setVenue(itemValue)}>
        <Picker.Item value={0} label={t('choose_a_venue')} />
        {venues.map(venue => (
          <Picker.Item
            color={colors.onSurface}
            style={{backgroundColor: colors.surface}}
            key={venue.id}
            label={venue.id + ' ' + venue.name}
            value={venue.id}
          />
        ))}
      </Picker>
    )
  } else {
    return null
  }
}

export default VenuePicker
