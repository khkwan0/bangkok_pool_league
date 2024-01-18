import React from 'react'
import {Picker} from '@react-native-picker/picker'

const DivisionPicker = props => {
  return (
    <Picker
      selectedValue={props.divisionId}
      mode="dropdown"
      onValueChange={(itemValue, itemPosition) => props.setDivision(itemValue)}>
      <Picker.Item key={0} label="No Division" value={0} />
      {props.divisions.map(division => (
        <Picker.Item
          key={division.id}
          label={division.id + ' ' + division.name}
          value={division.id}
        />
      ))}
    </Picker>
  )
}

export default DivisionPicker
