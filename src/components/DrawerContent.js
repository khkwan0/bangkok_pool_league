import React from 'react'
import {Image, StyleSheet, View} from 'react-native'
import {Text, TouchableRipple} from 'react-native-paper'
import {useAccount} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'
import Icon from '@components/Icon'
import {useSelector} from 'react-redux'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import config from '~/config'
import {Row} from '@ybase'
import {useTranslation} from 'react-i18next'

const drawerPanelStyle = StyleSheet.create({
  flex: 1,
})

const drawerItemStyle = StyleSheet.create({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 30,
})

const DrawerItem = ({navDest, icon, label, as}) => {
  const navigation = useNavigation()
  return (
    <View>
      <TouchableRipple
        onPress={() => navigation.navigate(navDest, {screen: 'Root'})}>
        <View style={drawerItemStyle}>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Icon name={icon} as={as} />
          </View>
          <View style={{flex: 2}}>
            <Text variant="titleLarge">{label}</Text>
          </View>
        </View>
      </TouchableRipple>
    </View>
  )
}

const DrawerContent = props => {
  const insets = useSafeAreaInsets()
  const user = useSelector(_state => _state.userData).user
  const account = useAccount()
  const {t} = useTranslation()

  async function HandleLogout() {
    await account.Logout()
    props.navigation.goBack()
  }

  return (
    <View
      style={[
        drawerPanelStyle,
        {
          paddingBottom: insets.bottom,
        }
      ]}>
      <View style={{flex: 5}}>
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
          <DrawerItem navDest="Matches" icon="home-outline" label={t('home')} />
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
          <DrawerItem navDest="Settings" icon="cog" label={t('settings')} />
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        {typeof user?.id !== 'undefined' && user.id && (
          <TouchableRipple onPress={() => HandleLogout()}>
            <View style={drawerItemStyle}>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <Icon name="logout" />
              </View>
              <View style={{flex: 2}}>
                <Text variant="titleLarge">{t('logout')}</Text>
              </View>
            </View>
          </TouchableRipple>
        )}
        <View style={{padding: 10}}>
          <Text>Build {config.build}</Text>
        </View>
      </View>
    </View>
  )
}

export default DrawerContent
