import {Checkbox, Host} from '@expo/ui'
import React from 'react'
import {useColorScheme} from 'react-native'

type AppCheckboxProps = {
  value: boolean
  onValueChange: (value: boolean) => void
  label?: string
  disabled?: boolean
  testID?: string
}

export default function AppCheckbox({
  value,
  onValueChange,
  label,
  disabled,
  testID,
}: AppCheckboxProps) {
  // Host defaults to the *device* scheme; pass RN Appearance so in-app
  // dark/light overrides keep Compose label text readable.
  const colorScheme = useColorScheme()

  return (
    <Host matchContents colorScheme={colorScheme ?? undefined}>
      <Checkbox
        value={value}
        onValueChange={onValueChange}
        label={label}
        disabled={disabled}
        testID={testID}
      />
    </Host>
  )
}
