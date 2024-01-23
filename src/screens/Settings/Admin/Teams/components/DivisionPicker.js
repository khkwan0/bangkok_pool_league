import React from 'react'
import {Picker} from '@react-native-picker/picker'
import {useYBase} from '~/lib/hooks'

const DivisionPicker = props => {
  const {colors} = useYBase()
  return (
    <Picker
      dropdownIconColor={colors.onSurface}
      selectedValue={props.divisionId}
      mode="dropdown"
      onValueChange={(itemValue, itemPosition) => props.setDivision(itemValue)}>
      <Picker.Item key={0} label="No Division" value={0} />
      {props.divisions.map(division => (
        <Picker.Item
          color={colors.onSurface}
          style={{backgroundColor: colors.surface}}
          key={division.id}
          label={division.id + ' ' + division.name}
          value={division.id}
        />
      ))}
    </Picker>
  )
}

export default DivisionPicker
