import React from 'react'
import {Image} from 'react-native'
import {Pressable, Switch, Text, Row, ScrollView, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'
import Icon from '@components/Icon'
import {useSelector} from 'react-redux'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import config from '~/config'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Feather from 'react-native-vector-icons/Feather'

const DrawerItem = ({navDest, icon, label, as}) => {
  const navigation = useNavigation()
  const {colors} = useYBase()
  return (
    <Pressable onPress={() => navigation.navigate(navDest)}>
      <Row alignItems="center">
        <View flex={1}>
          <Row space={20}>
            <Icon name={icon} as={as} color={colors.onSurface} />
            <Text fontSize="lg">{label}</Text>
          </Row>
        </View>
        <View flex={1} alignItems="flex-end">
          <MCI name="chevron-right" size={30} color={colors.onSurface} />
        </View>
      </Row>
    </Pressable>
  )
}

const DrawerContent = props => {
  const insets = useSafeAreaInsets()
  const user = useSelector(_state => _state.userData).user ?? {}
  const account = useAccount()
  const {t} = useTranslation()
  const {colors, colorMode, setColorMode} = useYBase()
  const [lang, setLang] = React.useState('en')
  const {i18n} = useTranslation()
  const [isMounted, setIsMounted] = React.useState(false)

  async function HandleLogout() {
    await account.Logout()
    props.navigation.goBack()
  }

  React.useEffect(() => {
    ;(async () => {
      try {
        const _lang = await AsyncStorage.getItem('language')
        setLang(_lang)
      } catch (e) {
        console.log(e)
      } finally {
        setIsMounted(true)
      }
    })()
  }, [])

  async function ToggleColorMode() {
    try {
      const newColorMode = colorMode === 'light' ? 'dark' : 'light'
      setColorMode(newColorMode)
      AsyncStorage.setItem('theme', newColorMode)
    } catch (e) {
      console.log(e)
    }
  }

  if (isMounted) {
    return (
      <ScrollView
        bgColor={colors.background}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: colors.background,
          paddingHorizontal: 20,
        }}>
        <Row flex={1} alignItems="center" mt={10}>
          <View flex={1}>
            <Text>Build {config.build}</Text>
          </View>
          <View flex={4} alignItems="flex-end">
            <Row alignItems="center" space={10}>
              <Feather name="sun" color={colors.onSurface} size={20} />
              <Switch
                value={colorMode === 'dark' ? true : false}
                onChange={() => ToggleColorMode()}
              />
              <MCI name="weather-night" color={colors.onSurface} size={20} />
            </Row>
          </View>
        </Row>
        <View flex={20} mt={10}>
          {typeof user?.id !== 'undefined' && user.id && (
            <Row alignItems="center">
              <View flex={1}>
                <Text fontSize="xl">{user.nickname}</Text>
                <Text>
                  #{user.id}
                  {typeof user.secondaryId !== 'undefined' && user.secondaryId
                    ? ` (${user.secondaryId})`
                    : ''}
                </Text>
              </View>
              <View style={{flex: 1}} alignItems="center">
                <Image
                  source={{uri: config.profileUrl + user.profile_picture}}
                  width={80}
                  height={80}
                  resizeMode="contain"
                  style={{borderRadius: 50}}
                />
              </View>
            </Row>
          )}
          <View gap={20}>
            {(typeof user?.id === 'undefined' || !user.id) && (
              <DrawerItem navDest="Login" icon="login" label={t('login')} />
            )}
            {typeof user !== 'undefined' &&
              user &&
              typeof user.role_id !== 'undefined' &&
              user.role_id === 9 && (
                <DrawerItem
                  navDest="Admin"
                  icon="controller-classic-outline"
                  label={t('admin')}
                />
              )}
            {typeof user.teams !== 'undefined' && user.teams.length > 0 && (
              <DrawerItem
                navDest="Player"
                icon="account-settings"
                label={t('me')}
              />
            )}
            <DrawerItem
              navDest="Seasons"
              icon="leaf-circle-outline"
              label={t('seasons')}
            />
            <DrawerItem
              navDest="Divisions"
              icon="division"
              label={t('divisions')}
            />
            <DrawerItem
              navDest="Venues"
              as="Ionicons"
              icon="location-outline"
              label={t('venues')}
            />
            <DrawerItem
              navDest="Teams"
              as="Ionicons"
              icon="people"
              label={t('teams')}
            />
            <DrawerItem
              navDest="Players"
              as="Ionicons"
              icon="person-outline"
              label={t('players')}
            />
            <DrawerItem
              navDest="Calendar"
              icon="calendar"
              label={t('calendar')}
            />
            <DrawerItem
              navDest="Schedules"
              icon="clipboard-list-outline"
              label={t('schedules')}
            />
            <DrawerItem
              navDest="Statistics"
              icon="chart-areaspline-variant"
              label={t('statistics')}
            />
            <DrawerItem
              navDest="Info"
              icon="information-outline"
              label={t('info_and_guides')}
            />
            <DrawerItem
              navDest="Preferences"
              icon="cog"
              label={t('preferences')}
            />
          </View>
        </View>
        <View flex={1} justifyContent="flex-end" pb={insets.bottom} mt={30}>
          {typeof user?.id !== 'undefined' && user.id && (
            <Pressable onPress={() => HandleLogout()}>
              <Row alignItems="center" space={20}>
                <MCI name="logout" color={colors.onSurface} size={30} />
                <Text fontSize="lg">{t('logout')}</Text>
              </Row>
            </Pressable>
          )}
        </View>
      </ScrollView>
    )
  } else {
    return <View flex={1} bgColor={colors.background} />
  }
}

export default DrawerContent
