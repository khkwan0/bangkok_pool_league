import React from 'react'
import {FlatList, RefreshControl} from 'react-native'
import {Pressable, Text, View} from '@ybase'
import {useAccount, useLeague, useYBase} from '~/lib/hooks'
import {useNavigation, useFocusEffect} from '@react-navigation/native'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TeamCard = ({team, idx}) => {
  const {colors} = useYBase()
  const bgColor = idx % 2 ? colors.teamCard : colors.teamCardAlt
  const navigation = useNavigation()

  function HandlePress() {
    navigation.navigate('Team', {team: team})
  }

  return (
    <Pressable onPress={() => HandlePress()}>
      <View style={{backgroundColor: bgColor, padding: 15}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Text>{team.name}</Text>
            <Text>{team.division_short_name}</Text>
          </View>
          <View>
            <Text>{team.total_players} players &gt;</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const TeamsHome = props => {
  const {colors} = useYBase()
  const league = useLeague()
  const [teams, setTeams] = React.useState([])
  const [refreshing, setRefreshing] = React.useState(false)
  const [showMineOnly, setShowMineOnly] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const user = useSelector(_state => _state.userData).user
  const {t} = useTranslation()
  const account = useAccount()

  const userTeams =
    typeof user?.teams !== 'undefined' ? user?.teams.map(_team => _team.id) : []

  async function GetTeams() {
    try {
      setRefreshing(true)
      const res = await league.GetTeams()
      if (showMineOnly) {
        const _teams = res.filter(team => userTeams.includes(team.id))
        setTeams(_teams)
      } else {
        setTeams(res)
      }
      setIsMounted(true)
    } catch (e) {
      console.log(e)
    } finally {
      setRefreshing(false)
    }
  }

  async function GetShowMineOnly() {
    try {
      const fromStorage = await AsyncStorage.getItem('my_teams_only')
      if (typeof fromStorage !== 'undefined' && fromStorage) {
        const temp = JSON.parse(fromStorage)
        if (
          typeof temp !== 'undefined' &&
          typeof temp.showMineOnly !== 'undefined' &&
          typeof user.id !== 'undefined' &&
          user.id
        ) {
          setShowMineOnly(temp.showMineOnly)
        } else {
          setShowMineOnly(false)
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsMounted(true)
    }
  }

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('blur', () => {
      setIsMounted(false)
    })
    return unsubscribe
  }, [props.navigation])

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      GetShowMineOnly()
    })
    return unsubscribe
  }, [props.navigation])

  /*
  React.useEffect(() => {
    ;(async () => {
      await GetShowMineOnly()
    })()
  }, [])
  */

  React.useEffect(() => {
    ;(async () => {
      if (isMounted) {
        await GetTeams()
      }
    })()
  }, [isMounted])

/*
  React.useEffect(() => {
    if (isMounted) {
      ;(async () => {
        await AsyncStorage.setItem(
          'my_teams_only',
          JSON.stringify({showMineOnly: showMineOnly}),
        )
        if (showMineOnly) {
          const _teams = teams.filter(team => userTeams.includes(team.id))
          setTeams(_teams)
        } else {
          GetTeams()
        }
      })()
    } else {
      setIsMounted(true)
    }
  }, [showMineOnly])

  React.useEffect(() => {
    if (isMounted) {
      GetTeams()
    }
  }, [isMounted])

  useFocusEffect(
    React.useCallback(() => {
      GetTeams()
    }, []),
  )
  */

  React.useEffect(() => {
    if (isMounted) {
      GetTeams()
    }
  }, [showMineOnly])

  async function onRefresh() {
    await GetTeams()
  }

  async function HandleSetShowMineOnly() {
    await AsyncStorage.setItem(
      'my_teams_only',
      JSON.stringify({showMineOnly: !showMineOnly}),
    )
    setShowMineOnly(s => !s)
  }

  React.useEffect(() => {
    account.FetchUser()
  }, [teams])

  if (isMounted) {
    return (
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            {typeof user?.teams !== 'undefined' && user.teams.length > 0 && (
              <View my={20} px={20}>
                <BouncyCheckbox
                  text={t('show_my_teams')}
                  textStyle={{textDecorationLine: 'none'}}
                  isChecked={showMineOnly}
                  onPress={() => HandleSetShowMineOnly()}
                />
              </View>
            )}
          </View>
        }
        contentContainerStyle={{backgroundColor: colors.background}}
        data={teams.sort((a, b) => (a.name > b.name ? 1 : -1))}
        renderItem={({item, index}) => (
          <TeamCard team={item} idx={index} userTeams={userTeams} />
        )}
      />
    )
  } else {
    return null
  }
}

export default TeamsHome
