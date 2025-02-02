import {useTranslation} from 'react-i18next'
import {Pressable, PressableProps, useColorScheme, View} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'

export type ThemedButtonProps = PressableProps & {
  lightColor?: string
  darkColor?: string
  children?: any
  icon?: React.ReactNode
}

export default function Button({
  style,
  disabled,
  children,
  icon,
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
        className="bg-blue-600 active:bg-purple-700 p-5 rounded-lg border"
        {...rest}>
        {typeof children === 'object' && [children]}
        {typeof children === 'string' && (
          <View className="flex-row items-center gap-2 justify-center">
            {icon}
            <Text className="text-center" style={{fontSize: 18}}>{t(children)}</Text>
          </View>
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
          <View className="flex-row items-center gap-2 justify-center">
            {icon}
            <Text className="text-center text-xl color-neutral-50">
              {t(children)}
            </Text>
          </View>
        )}
      </Pressable>
    )
  }
}
