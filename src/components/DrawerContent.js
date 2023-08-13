import React from 'react'
import {StyleSheet, View} from 'react-native'
import {Text, TouchableRipple} from 'react-native-paper'
import {useAccount} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'
import Icon from '@components/Icon'
import {useAppSelector} from '~/lib/hooks/redux'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import config from '~/config'

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
  const user = useAppSelector(_state => _state.user.user.data)
  const account = useAccount()

  async function HandleLogout() {
    await account.Logout()
    props.navigation.goBack()
  }

  return (
    <View
      style={[
        drawerPanelStyle,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}>
      <View style={{flex: 5}}>
        {typeof user?.id !== 'undefined' && user.id && (
          <View style={{flex: 1, padding: 10}}>
            <Text variant="titleLarge">{user.nickname}</Text>
            <Text variant="bodyLarge">player</Text>
          </View>
        )}
        <View style={{flex: 15, gap: 10, marginTop: 30}}>
          {(typeof user?.id === 'undefined' || !user.id) && (
            <DrawerItem navDest="Login" icon="login" label="Login" />
          )}
          <DrawerItem navDest="Matches" icon="home-outline" label="Home" />
          <DrawerItem
            navDest="Seasons"
            icon="leaf-circle-outline"
            label="Seasons"
          />
          <DrawerItem navDest="Divisions" icon="division" label="Divisions" />
          <DrawerItem
            navDest="Venues"
            as="Ionicons"
            icon="location-outline"
            label="Venues"
          />
          <DrawerItem
            navDest="Teams"
            as="Ionicons"
            icon="people"
            label="Teams"
          />
          <DrawerItem
            navDest="Players"
            as="Ionicons"
            icon="person-outline"
            label="Players"
          />
          <DrawerItem navDest="Calendar" icon="calendar" label="Calendar" />
          <DrawerItem
            navDest="Schedules"
            icon="clipboard-list-outline"
            label="Schedules"
          />
          <DrawerItem
            navDest="Statistics"
            icon="chart-areaspline-variant"
            label="Statistics"
          />
          <DrawerItem
            navDest="Info"
            icon="information-outline"
            label="Info & Guides"
          />
          <DrawerItem navDest="Settings" icon="cog" label="Settings" />
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
                <Text variant="titleLarge">Logout</Text>
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
