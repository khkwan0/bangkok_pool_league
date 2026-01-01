import Button from '@/components/Button'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import AdSpot from '@/components/upcoming/AdSpot'
import LiveScores from '@/components/upcoming/LiveScores'
import MatchCard from '@/components/upcoming/MatchCard'
import MatchCardOld from '@/components/upcoming/MatchCardOld'
import {useLeagueContext} from '@/context/LeagueContext'
import {useAccount, useAd, useLeague, useSeason} from '@/hooks'
import {MaterialIcons} from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import notifee from '@notifee/react-native'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import {
  getMessaging,
  onMessage,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging'
import {useTheme} from '@react-navigation/native'
import {usePathname, useRouter} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  useColorScheme,
} from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

interface ItemType {
  home_team_id: number
  away_team_id: number
  date: string
  ad_spot?: boolean
  key?: string
}

export default function UpcomingMatches(props: any) {
  const {colors} = useTheme()
  const {state, dispatch, StopRefreshUpcoming}: any = useLeagueContext()
  const [fixtures, setFixtures] = React.useState([])
  const user = state.user
  const [refreshing, setRefreshing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [showMineOnly, setShowMineOnly] = React.useState(true)
  const [showPostponed, setShowPostponed] = React.useState(false)
  const [seasonNumber, setSeasonNumber] = React.useState('')
  const [showFilters, setShowFilters] = React.useState(false)
  const filterHeight = React.useRef(new Animated.Value(0)).current
  const season = useSeason()
  const league = useLeague()
  const account = useAccount()
  const adHook = useAd()
  const {t} = useTranslation()
  const [needsUpdate, setNeedsUpdate] = React.useState(false)
  const router = useRouter()
  const {width} = Dimensions.get('window')
  const colorScheme = useColorScheme()

  const pathname = usePathname()

  React.useEffect(() => {
    if (state.refreshUpcoming) {
      GetMatches(true, showPostponed)
      StopRefreshUpcoming()
    }
  }, [state.refreshUpcoming])

  async function GetSeason() {
    try {
      const _season = await league.GetSeason()
      dispatch({type: 'SET_SEASON', payload: _season})
    } catch (e) {
      console.log(e)
    }
  }

  async function FetchUser() {
    try {
      await account.FetchUser()
    } catch (e) {
      console.log(e)
    } finally {
      setIsMounted(true)
    }
  }

  async function CheckVersion() {
    setNeedsUpdate(await account.CheckVersion())
  }

  function HandlePress(idx: number) {
    router.push({pathname: '/Match', params: fixtures[idx]})
  }

  async function HandleScorePress(matchId: number) {
    try {
      const res = await league.getMatchById(matchId)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        router.push({
          pathname: '/Match',
          params: {params: JSON.stringify(res.data)},
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function GetMatches(filtered = false, postponed = false) {
    try {
      setRefreshing(true)
      const query = []
      if (filtered) {
        query.push('noteam=false')
      } else {
        query.push('noteam=true')
      }
      if (postponed) {
        query.push('newonly=false')
      } else {
        query.push('newonly=true')
      }
      const res = await season.GetMatches(query)
      const _fixtures = await AddAdSpots(res)
      setFixtures(_fixtures)
    } catch (e) {
      console.log(e)
    } finally {
      setRefreshing(false)
    }
  }

  async function AddAdSpots(_fixtures: any) {
    const originalFixtures = [..._fixtures]
    try {
      let frequency = 0
      const res = await adHook.GetFrequency()
      if (
        typeof res?.frequency !== 'undefined' &&
        typeof res.frequency === 'number'
      ) {
        frequency = res.frequency
      }
      if (frequency > 0) {
        let i = 0
        while (i < _fixtures.length) {
          if ((i % frequency === 0 && i !== 0) || i === 1) {
            _fixtures.splice(i, 0, {
              index: i,
              key: 'ad_spot_' + i,
              ad_spot: true,
            })
          }
          i++
        }
        _fixtures.push({
          index: _fixtures.length,
          key: 'ad_spot_' + _fixtures.length,
          ad_spot: true,
        })
      }
      return _fixtures
    } catch (e) {
      console.error(e)
      return originalFixtures
    }
  }

  React.useEffect(() => {
    GetSeason()
  }, [])

  React.useEffect(() => {
    FetchUser()
  }, [])

  React.useEffect(() => {
    CheckVersion()
  }, [])

  function RefreshMatches() {
    if (typeof user?.teams !== 'undefined' && user.teams.length > 0) {
      if (showMineOnly) {
        if (showPostponed) {
          GetMatches(true, true)
        } else {
          GetMatches(true, false)
        }
      } else {
        if (showPostponed) {
          GetMatches(false, true)
        } else {
          GetMatches(false, false)
        }
      }
    } else {
      if (showPostponed) {
        GetMatches(false, true)
      } else {
        GetMatches(false, false)
      }
    }
  }

  React.useEffect(() => {
    if (isMounted) {
      RefreshMatches()
    }
  }, [showMineOnly, showPostponed, user, isMounted])
  /*
  React.useEffect(() => {
    if (
      typeof user?.teams !== 'undefined' &&
      user.teams.length > 0 &&
      showMineOnly
    ) {
      GetMatches(true)
    } else {
      GetMatches(false)
    }
  }, [user])
  */

  async function HandleSavePostponedOption() {
    try {
      await AsyncStorage.setItem(
        'postponed',
        JSON.stringify({showPostponed: showPostponed}),
      )
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    if (isMounted) {
      HandleSavePostponedOption()
    }
  }, [showPostponed])

  async function HandleTogglePostponed() {
    setShowPostponed(s => !s)
  }

  async function HandleGetPostponedOption() {
    try {
      const res = await AsyncStorage.getItem('postponed')
      if (res) {
        const _res = JSON.parse(res)
        setShowPostponed(_res.showPostponed)
      }
    } catch (e) {
      console.log(e)
    }
  }
  async function HandleUpdate() {
    try {
      const url =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/bangkok-pool-league/id6447631894'
          : 'https://play.google.com/store/apps/details?id=com.bangkok_pool_league'
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    HandleGetPostponedOption()
  }, [])

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      const messaging = getMessaging()
      const unsubscribe = onMessage(messaging, async remoteMessage => {
        try {
          // Force badge update by fetching unread count from API
          const count = await account.GetUnreadMessageCount()
          if (typeof count === 'number') {
            if (Platform.OS === 'ios') {
              PushNotificationIOS.setApplicationIconBadgeNumber(count)
            } else if (Platform.OS === 'android') {
              await notifee.setBadgeCount(count)
              console.log('Android badge updated from API (onMessage) to:', count)
            }
            dispatch({type: 'SET_MESSAGE_COUNT', payload: count})
          }
        } catch (e) {
          console.error('Error updating badge on notification:', e)
        }
      })
      return unsubscribe
    }
  }, [])

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      const messaging = getMessaging()
      setBackgroundMessageHandler(messaging, async remoteMessage => {
        try {
          const count = await account.GetUnreadMessageCount()
          if (Platform.OS === 'ios') {
            PushNotificationIOS.setApplicationIconBadgeNumber(count)
          } else if (Platform.OS === 'android') {
            await notifee.setBadgeCount(count)
            console.log('Android badge updated in background to:', count)
          }
          dispatch({type: 'SET_MESSAGE_COUNT', payload: count})
        } catch (e) {
          console.error('Error updating badge in background:', e)
        }
      })
    }
  }, [])

  const renderItem = React.useCallback(
    ({item, index}: {item: any; index: number}) => {
      if (typeof item.ad_spot !== 'undefined' && item.ad_spot) {
        return <AdSpot item={item} />
      } else if (state.isNewMatchCard) {
        return (
          <MatchCard
            matchInfo={item}
            idx={index}
            handlePress={HandlePress}
            showMineOnly={showMineOnly}
          />
        )
      } else {
        return (
          <MatchCardOld
            matchInfo={item}
            idx={index}
            handlePress={HandlePress}
          />
        )
      }
    },
    [showMineOnly, state.isNewMatchCard],
  )

  const toggleFilters = () => {
    Animated.timing(filterHeight, {
      toValue: showFilters ? 0 : 1,
      duration: 500,
      useNativeDriver: false,
    }).start()
    setShowFilters(s => !s)
  }

  const closeFilters = () => {
    if (showFilters) {
      Animated.timing(filterHeight, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start()
      setShowFilters(false)
    }
  }

  if (isMounted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F5F5F5',
        }}>
        {refreshing && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        {!refreshing && (
          <View className="flex-1">
            <View>
              {!user.id && (
                <View className="my-4 mx-6">
                  <Button
                    onPress={() =>
                      router.push({
                        pathname: '/Auth',
                        params: {from: pathname},
                      })
                    }>
                    {t('login_to_see_your_matches')}
                  </Button>
                </View>
              )}
              {(typeof state.showLiveScores === 'undefined' ||
                state.showLiveScores) && (
                <LiveScores handlePress={HandleScorePress} />
              )}
              {(typeof user?.teams === 'undefined' || user.teams.length < 1) &&
                user.id && (
                  <View className="my-2 mx-2">
                    <Text style={{textAlign: 'center'}}>
                      You are not affiliated with a team.
                    </Text>
                  </View>
                )}
              <Animated.View
                style={{
                  maxHeight: filterHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200],
                  }),
                  opacity: filterHeight,
                  overflow: 'hidden',
                  backgroundColor:
                    colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  borderRadius: 8,
                  marginHorizontal: 12,
                  marginBottom: 4,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: colorScheme === 'dark' ? '#37003C' : '#E0E0E0',
                }}>
                {typeof user?.teams !== 'undefined' &&
                  user.teams.length > 0 && (
                    <View className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <BouncyCheckbox
                        disabled={refreshing}
                        text={t('show_mine_only')}
                        textStyle={{
                          textDecorationLine: 'none',
                          fontSize: 16,
                          fontWeight: '500',
                          color: colorScheme === 'dark' ? '#ffffff' : '#37003C',
                        }}
                        isChecked={showMineOnly}
                        onPress={() => setShowMineOnly(s => !s)}
                        fillColor="#37003C"
                        iconStyle={{borderRadius: 4}}
                      />
                    </View>
                  )}
                <View className="p-2">
                  <BouncyCheckbox
                    disabled={refreshing}
                    text={t('show_postponed')}
                    textStyle={{
                      textDecorationLine: 'none',
                      fontSize: 16,
                      fontWeight: '500',
                      color: colorScheme === 'dark' ? '#ffffff' : '#37003C',
                    }}
                    isChecked={showPostponed}
                    onPress={() => HandleTogglePostponed()}
                    fillColor="#37003C"
                    iconStyle={{borderRadius: 4}}
                  />
                </View>
              </Animated.View>
              <Pressable
                className="flex-row items-center justify-center"
                onPress={toggleFilters}>
                <MaterialIcons
                  name="filter-list"
                  size={24}
                  style={{margin: 4}}
                  color={colorScheme === 'dark' ? '#ffffff' : '#37003C'}
                />
                <Text
                  type="subtitle"
                  className="text-[#37003C] dark:text-white">
                  {showFilters ? t('hide_filters') : t('show_filters')}
                </Text>
              </Pressable>
            </View>
            <View
              style={{height: '100%', overflow: 'hidden', marginHorizontal: 0}}>
              <FlatList
                contentContainerStyle={{
                  backgroundColor: colors.background,
                  paddingHorizontal: 0,
                }}
                style={{height: '100%'}}
                horizontal={state.isNewMatchCard ? true : false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                snapToInterval={width}
                decelerationRate="fast"
                snapToAlignment="center"
                scrollEnabled={true}
                directionalLockEnabled={true}
                alwaysBounceVertical={false}
                onScrollBeginDrag={closeFilters}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => RefreshMatches()}
                  />
                }
                bounces={true}
                keyExtractor={(item: ItemType, index) => {
                  if (typeof item.ad_spot !== 'undefined' && item.ad_spot) {
                    return item.key
                  } else {
                    return (
                      item.home_team_id + item.away_team_id + item.date + index
                    )
                  }
                }}
                data={fixtures}
                renderItem={renderItem}
              />
            </View>
          </View>
        )}
        {needsUpdate && (
          <View className="px-2">
            <Button
              style={{backgroundColor: 'red'}}
              onPress={() => HandleUpdate()}>
              <Text className="text-center">{t('update_available')}</Text>
            </Button>
          </View>
        )}
      </View>
    )
  } else {
    return null
  }
}
