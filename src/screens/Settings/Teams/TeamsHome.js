import React from 'react'
import {FlatList, RefreshControl} from 'react-native'
import {Pressable, Text, View} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'
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

  const userTeams =
    typeof user?.teams !== 'undefined' ? user?.teams.map(_team => _team.id) : []

  async function GetTeams() {
    try {
      setRefreshing(true)
      const res = await league.GetTeams()
      let __showMineOnly = false
      const _showMineOnly = await AsyncStorage.getItem('my_teams_only')
      if (typeof _showMineOnly !== 'undefined' && _showMineOnly) {
        const temp = JSON.parse(_showMineOnly)
        if (
          typeof temp !== 'undefined' &&
          typeof temp.showMineOnly !== 'undefined'
        ) {
          __showMineOnly = temp
        }
      }
      if (__showMineOnly) {
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

  React.useEffect(() => {
    if (isMounted) {
      AsyncStorage.setItem(
        'my_teams_only',
        JSON.stringify({showMineOnly: showMineOnly}),
      )
      if (showMineOnly) {
        const _teams = teams.filter(team => userTeams.includes(team.id))
        setTeams(_teams)
      } else {
        GetTeams()
      }
    }
  }, [showMineOnly])

  useFocusEffect(
    React.useCallback(() => {
      GetTeams()
    }, []),
  )

  async function onRefresh() {
    GetTeams()
  }

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
                onPress={() => setShowMineOnly(s => !s)}
              />
            </View>
          )}
        </View>
      }
      contentContainerStyle={{backgroundColor: colors.background}}
      data={teams}
      renderItem={({item, index}) => (
        <TeamCard team={item} idx={index} userTeams={userTeams} />
      )}
    />
  )
}

export default TeamsHome
