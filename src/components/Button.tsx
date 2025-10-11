import {useTranslation} from 'react-i18next'
import {Pressable, PressableProps, useColorScheme, View} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'

export type ThemedButtonProps = PressableProps & {
  lightColor?: string
  darkColor?: string
  children?: any
  icon?: React.ReactNode
  type?: 'primary' | 'outline'
  small?: boolean
}

export default function Button({
  style,
  disabled,
  children,
  icon,
  type,
  small,
  ...rest
}: ThemedButtonProps) {
  const colorScheme = useColorScheme()
  const {t} = useTranslation()

  const borderColor = colorScheme === 'dark' ? '#ddd' : '#888'
  const backgroundColor =
    colorScheme === 'dark'
      ? disabled
        ? '#bbb'
        : '#00d'
      : disabled
        ? '#888'
        : '#ddd'

  const pressedBackgroundColor =
    colorScheme === 'dark'
      ? disabled
        ? '#bbb'
        : '#00d'
      : disabled
        ? '#888'
        : '#ddd'

  if (colorScheme === 'dark') {
    const bgColor =
      type !== 'outline'
        ? `bg-blue-600 active:bg-purple-700`
        : 'border border-slate-50'
    const padding = small ? 'p-2' : 'p-4'
    return (
      <Pressable
        disabled={disabled}
        className={`${bgColor} ${padding} rounded-lg`}
        style={style}
        {...rest}>
        {typeof children === 'object' && [children]}
        {typeof children === 'string' && (
          <View className="flex-row items-center gap-2 justify-center">
            {icon}
            <Text className="text-center" style={{fontSize: small ? 14 : 18}}>
              {t(children)}
            </Text>
          </View>
        )}
      </Pressable>
    )
  } else {
    const bgColor =
      type !== 'outline'
        ? `bg-blue-600 active:bg-purple-700`
        : 'border border-slate-600'
    const textColor = type !== 'outline' ? 'text-white' : 'text-slate-600'
    const padding = small ? 'p-2' : 'p-4'
    return (
      <Pressable
        disabled={disabled}
        className={`${bgColor} ${padding} rounded-lg`}
        style={style}
        {...rest}>
        {typeof children === 'object' && [children]}
        {typeof children === 'string' && (
          <View className="flex-row items-center gap-2 justify-center">
            {icon}
            <Text className={`${textColor} text-center ${small ? 'text-base' : 'text-xl'}`}>
              {t(children)}
            </Text>
          </View>
        )}
      </Pressable>
    )
  }
}
