import {View, TouchableOpacity} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {DateTime} from 'luxon'
import React from 'react'
import {MaterialIcons} from '@expo/vector-icons'
import {useColorScheme} from 'nativewind'
import {router} from 'expo-router'

type MatchDateItemProps = {
  date: {
    matches: {
      match_id: number
      match_status_id: number
      match_date: string
      home_team_name: string
      away_team_name: string
      home_frames: number
      away_frames: number
    }[]
  }
}

export default function MatchDateItem({date}: MatchDateItemProps) {
  const dateObj = DateTime.fromISO(date.date)
  const [show, setShow] = React.useState(false)
  const colorscheme = useColorScheme()
  const isDark = colorscheme.colorScheme === 'dark'

  const count = React.useMemo(() => {
    return date.matches.reduce((acc, match) => {
      if (
        match.match_status_id === 1 &&
        DateTime.fromISO(match.match_date).toMillis() < Date.now()
      ) {
        return acc + 1
      }
      return acc
    }, 0)
  }, [date])

  function ToggleShow() {
    setShow(s => !s)
  }

  return (
    <View>
      <TouchableOpacity
        onPress={ToggleShow}
        className="p-4 flex-row items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm active:opacity-80">
        <View className="flex-row items-center">
          <MaterialIcons
            name="event"
            size={20}
            color={isDark ? '#94a3b8' : '#64748b'}
            className="mr-2"
          />
          <Text className="text-base font-medium text-slate-600 dark:text-slate-300">
            {dateObj.toLocaleString(DateTime.DATE_MED)}
          </Text>
        </View>
        {count > 0 && (
          <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
            <Text className="text-sm font-medium text-blue-600 dark:text-blue-300">
              {count} {count === 1 ? 'match' : 'matches'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {show && (
        <View className="mt-2 space-y-2">
          {date.matches.map(match => (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/completed/match',
                  params: {
                    params: JSON.stringify({
                      matchId: match.match_id,
                    }),
                  },
                })
              }}
              key={`${'completed'}-${match.match_id}`}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center mb-2">
                <View className="flex-[3] items-center">
                  <Text className="text-center font-medium text-slate-700 dark:text-slate-200">
                    {match.home_team_name}
                  </Text>
                </View>
                <View className="flex-[1] items-center">
                  <Text className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                    vs
                  </Text>
                </View>
                <View className="flex-[3] items-center">
                  <Text className="text-center font-medium text-slate-700 dark:text-slate-200">
                    {match.away_team_name}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <View className="flex-[3] items-center">
                  <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {match.home_frames ?? 0}
                  </Text>
                </View>
                <View className="flex-[1] items-center">
                  <Text className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                    {match.division_name}
                  </Text>
                </View>
                <View className="flex-[3] items-center">
                  <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {match.away_frames ?? 0}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}
