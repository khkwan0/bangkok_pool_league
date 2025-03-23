import {Text, type TextProps, StyleSheet} from 'react-native'
import {useTranslation} from 'react-i18next'
import {useThemeColor} from '@/hooks/useThemeColor'
import {useColorScheme} from 'nativewind'

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'
  children?: object | string
  className?: string
}

export function ThemedText({
  type = 'default',
  children,
  className,
  ...rest
}: ThemedTextProps) {
  const {t} = useTranslation()

  const defaultStyles = 'text-slate-700 dark:text-slate-200'
  let textSize = 'text-md'
  switch (type) {
    case 'default':
      textSize = `text-md`
      break
    case 'title':
      textSize = `text-2xl`
      break
    case 'defaultSemiBold':
      textSize = `text-lg font-semibold`
      break
    case 'subtitle':
      textSize = `text-lg font-bold`
      break
    case 'link':
      textSize = `text-lg`
      break
  }

  const finalClassName = `${className} ${textSize} ${defaultStyles}`

  return (
    <Text className={finalClassName} {...rest}>
      {typeof children === 'object' ? children : t(children as string)}
    </Text>
  )
}

const styles = StyleSheet.create({
  default: {
    fontSize: 18,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
})
