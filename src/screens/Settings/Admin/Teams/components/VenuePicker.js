import React from 'react'
import {Picker} from '@react-native-picker/picker'
import {useTranslation} from 'react-i18next'

const VenuePicker = props => {
  const {t} = useTranslation()
  const venues = props.venues

  if (venues.length > 0) {
    return (
      <Picker
        selectedValue={props.venue}
        mode="dropdown"
        onValueChange={(itemValue, itemPosition) => props.setVenue(itemValue)}>
        <Picker.Item value={0} label={t('choose_a_venue')} />
        {venues.map(venue => (
          <Picker.Item
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
