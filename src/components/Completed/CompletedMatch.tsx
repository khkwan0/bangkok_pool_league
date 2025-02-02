import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {DateTime} from 'luxon'
import {Pressable} from 'react-native'
import {router} from 'expo-router'
import {useColorScheme} from 'nativewind'

type CompletedMatchProps = {
  item: {
    match_id: number
    home_team_name: string
    away_team_name: string
    home_frames: number
    away_frames: number
    date: string
    original_date: string
  }
}

export default function CompletedMatch({item}: CompletedMatchProps) {
  const isHomeWinner = item.home_frames > item.away_frames
  const isAwayWinner = item.away_frames > item.home_frames
  const matchDate = DateTime.fromISO(item.date).toLocaleString(
    DateTime.DATE_MED,
  )
  const originalDate = item.original_date
    ? DateTime.fromISO(item.original_date).toLocaleString(DateTime.DATE_MED)
    : null
  const colorscheme = useColorScheme()

  function handlePress() {
    router.push({
      pathname: '/completed/match',
      params: {
        params: JSON.stringify({
          matchId: item.match_id,
        }),
      },
    })
  }

  const isDark = colorscheme.colorScheme === 'dark'
  return (
    <Pressable onPress={handlePress}>
      <View className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-medium text-slate-600">
            Match #{item.match_id}
          </Text>
          <View>
            <Text
              type="subtitle"
              className="text-slate-500 dark:text-slate-200">
              {matchDate}
            </Text>
            {originalDate && (
              <Text type="subtitle" className="text-sm text-slate-500">
                ({originalDate})
              </Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center mb-4">
          <View className="flex-1 items-center">
            <Text
              type="subtitle"
              className={`mb-1`}
              style={isHomeWinner ? {color: isDark ? '#0f0' : '00f'} : {}}>
              {item.home_team_name}
            </Text>
            <Text
              type="subtitle"
              style={isHomeWinner ? {color: isDark ? '#0f0' : '00f'} : {}}>
              {item.home_frames ? item.home_frames.toString() : '0'}
            </Text>
          </View>
          <View className="w-16 items-center">
            <Text>vs</Text>
          </View>
          <View className="flex-1 items-center">
            <Text
              type="subtitle"
              className={`mb-1`}
              style={!isHomeWinner ? {color: isDark ? '#0f0' : '#00f'} : {}}>
              {item.away_team_name}
            </Text>
            <Text
              type="subtitle"
              style={!isHomeWinner ? {color: isDark ? '#0f0' : '00f'} : {}}>
              {item.home_frames ? item.away_frames.toString() : '0'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}
