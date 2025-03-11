import React from 'react'
import {
  FlatList,
  Image,
  Pressable,
  Alert,
  Modal,
  useColorScheme,
} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useTeams, useLeague} from '@/hooks'
import config from '@/config'
import Row from '@/components/Row'
import {useTranslation} from 'react-i18next'
import {useLeagueContext, LeagueContextType} from '@/context/LeagueContext'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {useNavigation} from '@react-navigation/native'
import {useRouter} from 'expo-router'

type PlayerType = {
  nickname: string
  firstname?: string
  lastname?: string
  id: number
  profile_picture?: string
  role?: string
  flag?: string
}

type TeamType = {
  captains: PlayerType[]
  assistants: PlayerType[]
  players: PlayerType[]
  venue_logo?: string
  name: string
  id: number
}
interface TeamMembersProps {
  teamId: number
}

const MemberSection = ({
  title,
  players,
  teamId,
  isCaptain,
  isAssistant,
  isCaptainOtherTeam,
  isAssistantOtherTeam,
  isAdmin,
  onRefresh,
}: {
  title: string
  players: PlayerType[]
  teamId: number
  isCaptain: boolean
  isAssistant: boolean
  isAdmin: boolean
  isCaptainOtherTeam: boolean
  isAssistantOtherTeam: boolean
  onRefresh: () => void
}) => {
  const {t} = useTranslation()
  const league = useLeague()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const {state} = useLeagueContext()

  if (!players || players.length === 0) return null

  const handlePromote = async (playerId: number) => {
    try {
      const level = title.toLowerCase() === 'assistants' ? 2 : 1
      const response = await league.GrantPrivilege(playerId, teamId, level)
      if (response?.status === 'ok') {
        onRefresh()
      }
    } catch (error) {
      console.error('Error promoting player:', error)
    }
  }

  const handleDemote = async (playerId: number) => {
    try {
      const response = await league.RevokePrivileges(playerId, teamId)
      if (response?.status === 'ok') {
        onRefresh()
      }
    } catch (error) {
      console.error('Error demoting player:', error)
    }
  }

  const showControls =
    isAdmin ||
    ((isCaptain || isAssistant) &&
      (title.toLowerCase() === 'players' ||
        (title.toLowerCase() === 'assistants' && isCaptain)))

  return (
    <View className="mb-4">
      <Text type="defaultSemiBold" className="mb-2 text-lg">
        {t(title).toUpperCase()}
      </Text>
      {players.map(player => (
        <View
          key={player.id}
          className="p-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <Row className="items-center">
            <View className="flex-1 flex-row items-center">
              <Pressable
                className="mr-4"
                onPress={() =>
                  router.push({
                    pathname: './team/player',
                    params: {params: JSON.stringify({playerId: player.id})},
                  })
                }>
                <Text type="defaultSemiBold">
                  {player.flag} {player.nickname}
                </Text>
                {(player.firstname || player.lastname) && (
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {[
                      player.firstname,
                      player.lastname ? player.lastname.charAt(0) + '.' : null,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </Text>
                )}
              </Pressable>
              {player.profile_picture && (
                <Image
                  source={{uri: config.profileUrl + player.profile_picture}}
                  className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700"
                />
              )}
            </View>
            {state.user.id && (
              <View className="flex-row ml-2">
                <Pressable
                  className="p-1.5 bg-purple-50 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-800"
                  onPress={() =>
                    router.push({
                      pathname: '/Messages/New',
                      params: {
                        params: JSON.stringify({
                          nickname: player.nickname,
                          recipientId: player.id,
                        }),
                      },
                    })
                  }>
                  <MCI
                    name="message-text"
                    size={24}
                    color={
                      colorScheme === 'dark'
                        ? 'rgb(216, 180, 254)'
                        : 'rgb(107, 33, 168)'
                    }
                  />
                </Pressable>
              </View>
            )}
            {showControls && (
              <View className="flex-row ml-2">
                {title.toLowerCase() !== 'captains' && (
                  <Pressable
                    className="p-1.5 bg-purple-50 dark:bg-purple-900 rounded-lg mr-2 border border-purple-200 dark:border-purple-800"
                    onPress={() => handlePromote(player.id)}>
                    <MCI
                      name="arrow-up-circle"
                      size={24}
                      color={
                        colorScheme === 'dark'
                          ? 'rgb(216, 180, 254)'
                          : 'rgb(107, 33, 168)'
                      }
                    />
                  </Pressable>
                )}
                {title.toLowerCase() !== 'players' && (
                  <Pressable
                    className="p-1.5 bg-purple-50 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-800"
                    onPress={() => handleDemote(player.id)}>
                    <MCI
                      name="arrow-down-circle"
                      size={24}
                      color={
                        colorScheme === 'dark'
                          ? 'rgb(216, 180, 254)'
                          : 'rgb(107, 33, 168)'
                      }
                    />
                  </Pressable>
                )}
              </View>
            )}
          </Row>
        </View>
      ))}
    </View>
  )
}

export default function TeamMembers({teamId}: TeamMembersProps) {
  const [teamData, setTeamData] = React.useState<TeamType>({
    captains: [],
    assistants: [],
    players: [],
    name: '',
  })
  const [loading, setLoading] = React.useState(true)
  const [playerToRemove, setPlayerToRemove] = React.useState<{
    id: number
    nickname: string
  } | null>(null)
  const teams = useTeams()
  const league = useLeague()
  const {t} = useTranslation()
  const {state} = useLeagueContext() as LeagueContextType
  const navigation = useNavigation()
  const colorScheme = useColorScheme()
  const isCaptain = React.useMemo(() => {
    return teamData.captains.some(
      (captain: PlayerType) => captain.id === state.user?.id,
    )
  }, [teamData.captains, state.user?.id])

  const isCaptainOtherTeam = React.useMemo(() => {
    if (state.user?.role_id && state.user.role_id > 0) {
      return !teamData.captains.some(
        (captain: PlayerType) => captain.id === state.user?.id,
      )
    }
    return false
  }, [state.user?.role_id, state.user?.teams, teamId])

  const isAssistantOtherTeam = React.useMemo(() => {
    if (state.user?.role_id && state.user.role_id > 0) {
      return !teamData.assistants.some(
        (assistant: PlayerType) => assistant.id === state.user?.id,
      )
    }
    return false
  }, [state.user?.role_id, state.user?.teams, teamId])

  const isAssistant = React.useMemo(() => {
    return teamData.assistants.some(
      (assistant: PlayerType) => assistant.id === state.user?.id,
    )
  }, [teamData.assistants, state.user?.id])
  const isAdmin = React.useMemo(() => {
    return state.user?.role_id === 9
  }, [state.user?.role_id])
  const canManageRoles = React.useMemo(() => {
    return isAdmin || isCaptain || isAssistant
  }, [isAdmin, isCaptain, isAssistant])

  const refreshTeamInfo = React.useCallback(async () => {
    try {
      const response = await teams.GetTeamInfo(teamId)
      if (response?.status === 'ok' && response.data) {
        setTeamData(response.data)
      }
    } catch (error) {
      console.error('Error fetching team info:', error)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId])

  React.useEffect(() => {
    refreshTeamInfo()
  }, [refreshTeamInfo])

  React.useEffect(() => {
    if (teamData.name) {
      navigation.setOptions({
        title: teamData.name,
      })
    }
  }, [teamData.name, navigation])

  const handleRemovePlayer = async (playerId: number) => {
    try {
      const response = await league.RemovePlayerFromTeam(playerId, teamId)
      if (response?.status === 'ok') {
        refreshTeamInfo()
      } else if (response?.error) {
        Alert.alert(t('error'), response.error)
      }
    } catch (error) {
      console.error('Error removing player:', error)
      Alert.alert(t('error'), t('error_removing_player'))
    } finally {
      setPlayerToRemove(null)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{t('loading')}</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 p-4">
      <Modal
        visible={playerToRemove !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPlayerToRemove(null)}>
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-sm shadow-xl">
            <Text type="defaultSemiBold" className="text-lg mb-4 text-center">
              {t('confirm_remove_player', {
                player: playerToRemove?.nickname,
                team: teamData.name,
              })}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              {t('remove_player_warning')}
            </Text>
            <View className="flex-row justify-end space-x-2">
              <Pressable
                className="flex-1 p-2 bg-gray-100 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-500"
                onPress={() => setPlayerToRemove(null)}>
                <Text className="text-center dark:text-white">
                  {t('cancel')}
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 p-2 bg-red-600 rounded-lg"
                onPress={() => handleRemovePlayer(playerToRemove!.id)}>
                <Text className="text-white text-center">{t('remove')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <FlatList
        data={teamData.players}
        ListHeaderComponent={
          <>
            <View className="items-center mb-6">
              {teamData.venue_logo ? (
                <Image
                  source={{uri: config.logoUrl + teamData.venue_logo}}
                  className="w-24 h-24 mb-2"
                  resizeMode="contain"
                />
              ) : (
                <View className="w-24 h-24 mb-2 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center">
                  <Text
                    type="title"
                    className="text-2xl bg-gray-500 dark:bg-red-500 py-6 px-8 rounded-full">
                    {teamData.name.charAt(0)}
                  </Text>
                </View>
              )}
              <Text type="subtitle" className="text-xl">
                {teamData.name}
              </Text>
              <Text>#{teamData.id}</Text>
            </View>
            <MemberSection
              title="captains"
              players={teamData.captains}
              teamId={teamId}
              isCaptain={isCaptain}
              isAssistant={isAssistant}
              isAdmin={isAdmin}
              isCaptainOtherTeam={isCaptainOtherTeam}
              isAssistantOtherTeam={isAssistantOtherTeam}
              onRefresh={refreshTeamInfo}
            />
            <MemberSection
              title="assistants"
              players={teamData.assistants}
              teamId={teamId}
              isCaptain={isCaptain}
              isAssistant={isAssistant}
              isAdmin={isAdmin}
              isCaptainOtherTeam={isCaptainOtherTeam}
              isAssistantOtherTeam={isAssistantOtherTeam}
              onRefresh={refreshTeamInfo}
            />
            <Text type="defaultSemiBold" className="mb-2 text-lg">
              {t('players').toUpperCase()}
            </Text>
          </>
        }
        renderItem={({item}) => (
          <View className="p-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <Row className="items-center">
              <View className="flex-1 flex-row items-center">
                <View className="mr-4">
                  <Text type="defaultSemiBold">
                    {item.flag} {item.nickname}
                  </Text>
                  {(item.firstname || item.lastname) && (
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {[
                        item.firstname,
                        item.lastname ? item.lastname.charAt(0) + '.' : null,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    </Text>
                  )}
                </View>
                {item.profile_picture && (
                  <Image
                    source={{uri: config.profileUrl + item.profile_picture}}
                    className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700"
                  />
                )}
              </View>
              {canManageRoles && (
                <View className="flex-row ml-2">
                  <Pressable
                    className="p-1.5 bg-purple-50 dark:bg-purple-900 rounded-lg mr-2 border border-purple-200 dark:border-purple-800"
                    onPress={async () => {
                      try {
                        const response = await league.GrantPrivilege(
                          item.id,
                          teamId,
                          1,
                        )
                        if (response?.status === 'ok') {
                          refreshTeamInfo()
                        }
                      } catch (error) {
                        console.error('Error promoting player:', error)
                      }
                    }}>
                    <MCI
                      name="arrow-up-circle"
                      size={24}
                      color={
                        colorScheme === 'dark'
                          ? 'rgb(216, 180, 254)'
                          : 'rgb(107, 33, 168)'
                      }
                    />
                  </Pressable>
                  <Pressable
                    className="py-1.5 px-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-800"
                    onPress={() =>
                      setPlayerToRemove({id: item.id, nickname: item.nickname})
                    }>
                    <MCI
                      name="account-remove"
                      size={24}
                      color={
                        colorScheme === 'dark'
                          ? 'rgb(254, 202, 202)'
                          : 'rgb(185, 28, 28)'
                      }
                    />
                  </Pressable>
                </View>
              )}
            </Row>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <Text>{t('no_players_found')}</Text>
          </View>
        }
      />
    </View>
  )
}
