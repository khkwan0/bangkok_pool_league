import React from 'react'
import {
  TextInput as RNTextInput,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native'
import {Picker} from '@react-native-picker/picker'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  type?: 'primary' | 'secondary'
  textStyle?: TextStyle
}

export const Button = ({
  title,
  type = 'primary',
  style,
  textStyle,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        type === 'primary' ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      {...props}>
      <Text
        style={[
          styles.buttonText,
          type === 'primary'
            ? styles.primaryButtonText
            : styles.secondaryButtonText,
          textStyle,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export const TextInput = ({style, ...props}: TextInputProps) => {
  return <RNTextInput style={[styles.textInput, style]} {...props} />
}

interface DropdownProps {
  items: {label: string; value: string}[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  style?: ViewStyle
}

export const Dropdown = ({
  items,
  value,
  onValueChange,
  placeholder,
  style,
}: DropdownProps) => {
  return (
    <View style={[styles.dropdownContainer, style]}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}>
        {placeholder && <Picker.Item label={placeholder} value="" />}
        {items.map(item => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  )
}

const styles = StyleSheet.create({
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  button: {
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: '#007bff',
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
})
