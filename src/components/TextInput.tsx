import {
  TextInput as RNTextInput,
  TextInputProps,
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import type {Icon} from '@expo/vector-icons/build/createIconSet'

interface CustomTextInputProps extends TextInputProps {
  leftIcon?: typeof MaterialCommunityIcons
  rightIcon?: typeof MaterialCommunityIcons
  leftIconProps?: React.ComponentProps<typeof MaterialCommunityIcons>
  rightIconProps?: React.ComponentProps<typeof MaterialCommunityIcons>
  onLeftIconPress?: () => void
  onRightIconPress?: () => void
  iconSize?: number
  iconColor?: string
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
}

export default function CustomTextInput({
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftIconProps,
  rightIconProps,
  onLeftIconPress,
  onRightIconPress,
  iconSize = 24,
  iconColor = '#666',
  style,
  containerStyle,
  inputStyle,
  ...props
}: CustomTextInputProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        ...containerStyle,
      }}
    >
      {LeftIcon && (
        <TouchableOpacity
          onPress={onLeftIconPress}
          disabled={!onLeftIconPress}
          style={{
            position: 'absolute',
            zIndex: 1,
            padding: 8,
            left: 0,
          }}
        >
          <LeftIcon size={iconSize} color={iconColor} {...leftIconProps} />
        </TouchableOpacity>
      )}
      <RNTextInput
        style={[
          {
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingLeft: LeftIcon ? 40 : 12,
            paddingRight: RightIcon ? 40 : 12,
            ...inputStyle,
          },
          style,
        ]}
        {...props}
      />
      {RightIcon && (
        <TouchableOpacity
          onPress={onRightIconPress}
          disabled={!onRightIconPress}
          style={{
            position: 'absolute',
            zIndex: 1,
            padding: 8,
            right: 0,
          }}
        >
          <RightIcon size={iconSize} color={iconColor} {...rightIconProps} />
        </TouchableOpacity>
      )}
    </View>
  )
}
