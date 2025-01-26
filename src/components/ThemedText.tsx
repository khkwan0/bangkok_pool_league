import {Text, type TextProps, StyleSheet} from 'react-native'
import {useTranslation} from 'react-i18next'
import {useThemeColor} from '@/hooks/useThemeColor'

export type ThemedTextProps = TextProps & {
  lightColor?: string
  darkColor?: string
  textAlign?: 'center' | 'left' | 'right'
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'
  children?: object | string
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  textAlign,
  type = 'default',
  children,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({light: lightColor, dark: darkColor}, 'text')
  const {t} = useTranslation()

  return (
    <Text
      style={[
        {textAlign},
        {color},
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}>
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
