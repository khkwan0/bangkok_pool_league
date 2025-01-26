import {useThemeColor} from '@/hooks/useThemeColor'
import {useTranslation} from 'react-i18next'
import {Pressable, PressableProps, Text, useColorScheme} from 'react-native'

export type ThemedButtonProps = PressableProps & {
  lightColor?: string
  darkColor?: string
  children?: any
}
export default function Button({
  style,
  disabled,
  children,
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
    return (
      <Pressable
        disabled={disabled}
        className="bg-blue-200 active:bg-purple-700 p-4 rounded border"
        {...rest}>
        {typeof children === 'object' && [children]}
        {typeof children === 'string' && (
          <Text className="text-center">{t(children)}</Text>
        )}
      </Pressable>
    )
  } else {
    return (
      <Pressable
        disabled={disabled}
        className="bg-blue-600 active:bg-purple-700 p-4 rounded border"
        {...rest}>
        {typeof children === 'object' && [children]}
        {typeof children === 'string' && (
          <Text className="text-center text-xl color-neutral-50">
            {t(children)}
          </Text>
        )}
      </Pressable>
    )
  }
}
