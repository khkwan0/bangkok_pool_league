import React from 'react'
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useMatch} from '@/hooks'
import {FlatList, Pressable} from 'react-native'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {DateTime} from 'luxon'

type Frame = {
  frameId: number
  homePlayers: {nickName: string; id: number}[]
  awayPlayers: {nickName: string; id: number}[]
  homeWin: number
}

type MatchDetails = Frame[]

type MatchMetadata = {
  matchDate: string
  home_team_name: string
  away_team_name: string
  home_frames: number
  away_frames: number
}

function FrameRow({frame, index}: {frame: Frame; index: number}) {
  const router = useRouter()
  return (
    <View className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
      <View className="mb-4">
        <Text className="text-sm font-medium text-slate-500">
          <Text className="font-semibold">Frame</Text> {index + 1}
        </Text>
      </View>
      <View className="flex-row items-center">
        {/* Home Team Side */}
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flex: 1, alignItems: 'flex-start'}}>
            {frame.homePlayers.map((player, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  router.push({
                    pathname: '/completed/match/player',
                    params: {
                      params: JSON.stringify({
                        playerId: player.playerId,
                      }),
                    },
                  })
                }}>
                <Text
                  type="subtitle"
                  className="text-base text-slate-700 font-medium leading-relaxed">
                  {player.nickName}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{flex: 0.5, alignItems: 'flex-end'}}>
            {frame.homeWin === 1 && (
              <View className="px-2 py-1">
                <MCI name="check-circle" size={24} color="rgb(22, 163, 74)" />
              </View>
            )}
          </View>
        </View>

        {/* Center VS */}
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text className="text-base font-semibold text-slate-400">vs</Text>
        </View>

        {/* Away Team Side */}
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flex: 0.5, alignItems: 'flex-start'}}>
            {frame.homeWin === 0 && (
              <View className="px-2 py-1">
                <MCI name="check-circle" size={24} color="rgb(22, 163, 74)" />
              </View>
            )}
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            {frame.awayPlayers.map((player, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  router.push({
                    pathname: '/completed/match/player',
                    params: {
                      params: JSON.stringify({playerId: player.playerId}),
                    },
                  })
                }}>
                <Text key={idx} className="text-right" type="subtitle">
                  {player.nickName}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

export default function CompletedMatchDetails({matchId}: {matchId: number}) {
  const matchHook = useMatch()
  const [matchDetails, setMatchDetails] = React.useState<MatchDetails | null>(
    null,
  )
  const [loading, setLoading] = React.useState(true)
  const navigation = useNavigation()
  const [matchMetadata, setMatchMetadata] =
    React.useState<MatchMetadata | null>(null)

  React.useEffect(() => {
    async function getMatchDetails(matchId: number) {
      try {
        const res = await matchHook.GetMatchDetails(matchId)
        setMatchDetails(res.data)
        const res2 = await matchHook.GetMatchMetadata(matchId)
        setMatchMetadata(res2.data)
      } catch (error) {
        console.error('Failed to fetch match details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      getMatchDetails(matchId)
    }
  }, [matchId])

  React.useEffect(() => {
    navigation.setOptions({
      title: `Match #${matchId}`,
    })
  }, [matchId])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    )
  }

  if (!matchDetails) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Match not found</Text>
      </View>
    )
  }

  const isHomeWinner = matchMetadata?.home_frames > matchMetadata?.away_frames
  const isAwayWinner = matchMetadata?.away_frames > matchMetadata?.home_frames

  return (
    <View className="flex-1 p-4">
      <View className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-medium text-slate-600">
            Match #{matchId}
          </Text>
          <View>
            <Text className="text-sm text-slate-500">
              {DateTime.fromISO(matchMetadata?.matchDate).toLocaleString(
                DateTime.DATE_MED,
              )}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="flex-1 items-center">
            <Text
              className={`text-base font-semibold mb-1 ${isHomeWinner ? 'text-blue-600' : 'text-slate-700'}`}>
              {matchMetadata?.home_team_name}
            </Text>
            <Text
              className={`text-2xl font-bold ${isHomeWinner ? 'text-blue-600' : 'text-slate-700'}`}>
              {matchMetadata?.home_frames
                ? matchMetadata?.home_frames.toString()
                : '0'}
            </Text>
          </View>
          <View className="w-16 items-center">
            <Text className="text-sm text-slate-400 font-medium">vs</Text>
          </View>
          <View className="flex-1 items-center">
            <Text
              className={`text-base font-semibold mb-1 ${isAwayWinner ? 'text-blue-600' : 'text-slate-700'}`}>
              {matchMetadata?.away_team_name}
            </Text>
            <Text
              className={`text-2xl font-bold ${isAwayWinner ? 'text-blue-600' : 'text-slate-700'}`}>
              {matchMetadata?.away_frames
                ? matchMetadata?.away_frames.toString()
                : '0'}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={matchDetails}
        renderItem={({item, index}) => <FrameRow frame={item} index={index} />}
        ItemSeparatorComponent={() => <View className="h-4" />}
        keyExtractor={item => item.frameId.toString()}
      />
    </View>
  )
}
