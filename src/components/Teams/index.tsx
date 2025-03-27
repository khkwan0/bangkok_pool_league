import React from 'react'
import {FlatList, Pressable, View} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as CardView} from '@/components/ThemedView'
import {useLeague} from '@/hooks'
import {router} from 'expo-router'
import {useTranslation} from 'react-i18next'
import {useLeagueContext} from '@/context/LeagueContext'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useTheme} from '@react-navigation/native'

type TeamType = {
  id: number
  name: string
  total_players: number
  division_short_name: string
}

type TeamCardProps = {
  team: TeamType
  index: number
  fromTabs?: boolean
}

function TeamCard({team, index, fromTabs}: TeamCardProps) {
  function handlePress() {
    router.push(
      {
        pathname: './team',
        params: {params: JSON.stringify({teamId: team.id})},
      },
      {
        relativeToDirectory: true,
      },
    )
  }

  return (
    <Pressable onPress={handlePress}>
      <CardView className="p-5 mx-4 my-2 rounded-xl bg-white border border-slate-200 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-base font-semibold mb-1 text-slate-800">
              {team.name}
            </Text>
            <Text className="text-sm text-slate-500">
              {team.division_short_name}
            </Text>
          </View>
          <CardView className="bg-blue-200 px-3 py-1.5 rounded-xl">
            <Text className="text-sm text-blue-700 font-medium">
              {team.total_players} members
            </Text>
          </CardView>
        </View>
      </CardView>
    </Pressable>
  )
}

export default function TeamList({fromTabs = false}: {fromTabs?: boolean}) {
  const {state} = useLeagueContext()
  const user = state.user
  const [teams, setTeams] = React.useState<TeamType[]>([])
  const [refreshing, setRefreshing] = React.useState(false)
  const [showMineOnly, setShowMineOnly] = React.useState(
    typeof user.id !== 'undefined' ? true : false,
  )
  const {colors} = useTheme()
  const league = useLeague()
  const {t} = useTranslation()

  const userTeams = React.useMemo(() => {
    return user?.teams?.map((team: {id: number}) => team.id) || []
  }, [user?.teams])

  async function getTeams() {
    try {
      setRefreshing(true)
      const response = await league.GetTeams()
      const sortedTeams = response.sort((a: TeamType, b: TeamType) =>
        a.name.localeCompare(b.name),
      )
      if (showMineOnly) {
        setTeams(
          sortedTeams.filter((team: TeamType) => userTeams.includes(team.id)),
        )
      } else {
        setTeams(sortedTeams)
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setRefreshing(false)
    }
  }

  async function handleSetShowMineOnly() {
    const newValue = !showMineOnly
    await AsyncStorage.setItem(
      'my_teams_only',
      JSON.stringify({showMineOnly: newValue}),
    )
    setShowMineOnly(newValue)
  }

  async function loadShowMineOnly() {
    try {
      if (user?.id) {
        const stored = await AsyncStorage.getItem('my_teams_only')
        if (stored) {
          const {showMineOnly: value} = JSON.parse(stored)
          setShowMineOnly(value)
        } else {
          if (user.teams && user.teams.length > 0) {
            setShowMineOnly(true)
          } else {
            setShowMineOnly(false)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load show mine only preference:', error)
    }
  }

  React.useEffect(() => {
    getTeams()
  }, [showMineOnly])

  React.useEffect(() => {
    loadShowMineOnly()
  }, [])

  return (
    <View className="flex-1">
      <FlatList
        contentContainerStyle={{
          backgroundColor: colors.background,
        }}
        ListHeaderComponent={
          typeof user.id !== 'undefined' ? (
            <View className="px-4 py-3 border-b border-slate-200">
              <BouncyCheckbox
                text={t('show_my_teams')}
                textStyle={{textDecorationLine: 'none'}}
                isChecked={showMineOnly}
                onPress={handleSetShowMineOnly}
              />
            </View>
          ) : null
        }
        data={teams}
        renderItem={({item, index}) => (
          <TeamCard team={item} index={index} fromTabs={fromTabs} />
        )}
        keyExtractor={item => item.id.toString()}
        refreshing={refreshing}
        onRefresh={getTeams}
      />
    </View>
  )
}
