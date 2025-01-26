import React from 'react'
import {useLocalSearchParams, useNavigation} from 'expo-router'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useMatch} from '@/hooks'
import {FlatList} from 'react-native'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'

type Frame = {
  frameId: number
  homePlayers: {nickName: string}[]
  awayPlayers: {nickName: string}[]
  homeWin: number
}

function FrameRow({frame, index}: {frame: Frame; index: number}) {
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
              <Text
                type="subtitle"
                key={idx}
                className="text-base text-slate-700 font-medium leading-relaxed">
                {player.nickName}
              </Text>
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
          <View style={{flex: 0.5, alignItems: 'flex-start'}} >
            {frame.homeWin === 0 && (
              <View className="px-2 py-1">
                <MCI name="check-circle" size={24} color="rgb(22, 163, 74)" />
              </View>
            )}
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            {frame.awayPlayers.map((player, idx) => (
              <Text key={idx} className="text-right" type="subtitle">
                {player.nickName}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

export default function CompletedMatchDetails() {
  const {
    matchId,
    matchDate,
    home_team_name,
    away_team_name,
    home_frames,
    away_frames,
  } = useLocalSearchParams()
  const matchHook = useMatch()
  const [matchDetails, setMatchDetails] = React.useState<MatchDetails | null>(
    null,
  )
  const [loading, setLoading] = React.useState(true)
  const navigation = useNavigation()
  React.useEffect(() => {
    async function getMatchDetails() {
      try {
        const res = await matchHook.GetMatchDetails(Number(matchId))
        setMatchDetails(res.data)
      } catch (error) {
        console.error('Failed to fetch match details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      getMatchDetails()
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

  const isHomeWinner = home_frames > away_frames
  const isAwayWinner = away_frames > home_frames

  return (
    <View className="flex-1 p-4">
      <View className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-medium text-slate-600">
            Match #{matchId}
          </Text>
          <View>
            <Text className="text-sm text-slate-500">{matchDate}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="flex-1 items-center">
            <Text
              className={`text-base font-semibold mb-1 ${isHomeWinner ? 'text-blue-600' : 'text-slate-700'}`}>
              {home_team_name}
            </Text>
            <Text
              className={`text-2xl font-bold ${isHomeWinner ? 'text-blue-600' : 'text-slate-700'}`}>
              {home_frames ? home_frames.toString() : '0'}
            </Text>
          </View>
          <View className="w-16 items-center">
            <Text className="text-sm text-slate-400 font-medium">vs</Text>
          </View>
          <View className="flex-1 items-center">
            <Text
              className={`text-base font-semibold mb-1 ${isAwayWinner ? 'text-blue-600' : 'text-slate-700'}`}>
              {away_team_name}
            </Text>
            <Text
              className={`text-2xl font-bold ${isAwayWinner ? 'text-blue-600' : 'text-slate-700'}`}>
              {away_frames ? away_frames.toString() : '0'}
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
