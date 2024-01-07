import React from 'react'
import {Image, StyleSheet} from 'react-native'
import {Pressable, Text, Row, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'
import Icon from '@components/Icon'
import {useSelector} from 'react-redux'
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context'
import config from '~/config'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const drawerItemStyle = StyleSheet.create({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 30,
})

const DrawerItem = ({navDest, icon, label, as}) => {
  const navigation = useNavigation()
  const {colors} = useYBase()
  return (
    <View my={2}>
      <Pressable onPress={() => navigation.navigate(navDest)}>
        <Row alignItems="center">
          <Row flex={1} space={20}>
            <Icon name={icon} as={as} color={colors.onSurface} />
            <Text fontSize="lg">{label}</Text>
          </Row>
          <View flex={1} alignItems="flex-end">
            <MCI name="chevron-right" size={30} color={colors.onSurface} />
          </View>
        </Row>
      </Pressable>
    </View>
  )
}

const DrawerContent = props => {
  const insets = useSafeAreaInsets()
  const user = useSelector(_state => _state.userData).user
  const account = useAccount()
  const {t} = useTranslation()
  const {colors} = useYBase()

  async function HandleLogout() {
    await account.Logout()
    props.navigation.goBack()
  }

  return (
      <View flex={1} bgColor={colors.background} px={20}>
        <View flex={5}>
          {typeof user?.id !== 'undefined' && user.id && (
            <Row alignItems="center" pt={insets.top}>
              <View style={{flex: 1, padding: 10}}>
                <Text variant="titleLarge">{user.nickname}</Text>
                <Text variant="bodyLarge">player</Text>
              </View>
              <View style={{flex: 1}}>
                <Image
                  source={{uri: config.profileUrl + user.profile_picture}}
                  width={100}
                  height={100}
                  resizeMode="contain"
                  style={{borderRadius: 50}}
                />
              </View>
            </Row>
          )}
          <View style={{flex: 15, gap: 10, marginTop: 30}}>
            {(typeof user?.id === 'undefined' || !user.id) && (
              <DrawerItem navDest="Login" icon="login" label={t('login')} />
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
        <View flex={1} justifyContent="flex-end" pb={insets.bottom}>
          {typeof user?.id !== 'undefined' && user.id && (
            <Pressable onPress={() => HandleLogout()}>
              <Row alignItems="center" space={20}>
                <MCI name="logout" color={colors.onSurface} size={30} />
                <Text fontSize="lg">{t('logout')}</Text>
              </Row>
            </Pressable>
          )}
          <View style={{padding: 10}}>
            <Text>Build {config.build}</Text>
          </View>
        </View>
      </View>
  )
}

export default DrawerContent
