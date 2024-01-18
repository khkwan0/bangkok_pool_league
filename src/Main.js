/* eslint-disable react/no-unstable-nested-components */
import React from 'react'
import Home from '@screens/Home'
import {useAccount, useLeague, useYBase} from '~/lib/hooks'
import '~/i18n'
import {useTranslation} from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {View} from '@ybase'

const Main = props => {
  const account = useAccount()
  const league = useLeague()
  const [isMounted, setIsMounted] = React.useState(false)
  const {i18n} = useTranslation()
  const {colors, setColorMode} = useYBase()

  React.useEffect(() => {
    account.FetchUser()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      const season = await league.GetSeason()
    })()
  }, [league])

  React.useEffect(() => {
    ;(async () => {
      try {
        const lang = await AsyncStorage.getItem('language')
        i18n.changeLanguage(lang ? lang : 'en')
        const storedColorMode = (await AsyncStorage.getItem('theme')) ?? 'light'
        setColorMode(storedColorMode)
      } catch (e) {
        console.log(e)
      }
    })()
    return () => setIsMounted(false)
  }, [])

  return (
    <View flex={1} bgColor={colors.background}>
      <Home />
    </View>
  )

  /*
  if (drawerOnly) {
    return (
      <View style={{flex: 1, paddingTop: insets.top}}>
        <Drawer.Navigator
          drawerContent={params => <DrawerContent {...params} />}
          screenOptions={({navigation}) => ({
            headerStyle: {
              backgroundColor: colors.headerBackground,
            },
            headerTitleStyle: {
              color: colors.onHeaderBackground,
            },
            drawerPosition: 'right',
            headerTitleAlign: 'center',
            headerLeft: () => null,
            headerRight: () => (
              <IconButton icon="menu" onPress={() => navigation.openDrawer()} />
            ),
          })}>
          <Drawer.Screen
            name="Matches"
            component={Matches}
            options={{headerShown: false}}
          />
          <Drawer.Screen name="Login" component={Login} />
          <Drawer.Screen name="Divisions" component={Divisions} />
          <Drawer.Screen
            name="Venues"
            component={Venues}
            options={{headerShown: false}}
          />
          <Drawer.Screen
            name="Teams"
            component={Teams}
            options={{headerShown: false}}
          />
          <Drawer.Screen
            name="Players"
            component={Players}
            options={{headerShown: false}}
          />
          <Drawer.Screen name="Calendar" component={Calendar} />
          <Drawer.Screen name="Schedules" component={Schedules} />
          <Drawer.Screen name="Seasons" component={Seasons} />
          <Drawer.Screen
            name="Statistics"
            component={Statistics}
            options={{headerShown: false}}
          />
          <Drawer.Screen name="Info" component={Info} />
          <Drawer.Screen
            name="Settings"
            component={Settings}
            options={{headerTitle: t('settings')}}
          />
        </Drawer.Navigator>
      </View>
    )
  } else {
    return (
      <Tab.Navigator
        screenOptions={{
          lazy: false,
          headerShown: false,
        }}>
        <Tab.Screen
          name="Matches"
          component={Matches}
          options={{
            tabBarLabel: 'Matches',
            tabBarIcon: ({color, size}) => {
              return (
                <MaterialCommunityIcons
                  name="billiards-rack"
                  size={size}
                  color={color}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={Calendar}
          options={{
            tabBarIcon: ({color, size}) => {
              return (
                <MaterialCommunityIcons
                  name="calendar"
                  size={size}
                  color={color}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name="Me"
          component={Account}
          options={{
            tabBarIcon: ({color, size}) => {
              return (
                <MaterialCommunityIcons
                  name="head-dots-horizontal"
                  size={size}
                  color={color}
                />
              )
            },
          }}
        />
      </Tab.Navigator>
    )
  }
    */
}

export default Main
