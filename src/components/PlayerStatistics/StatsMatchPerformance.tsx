import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {usePathname, useRouter} from 'expo-router'
import {DateTime} from 'luxon'
import {Pressable} from 'react-native'

type StatType = {
  date: string
  matchId: number
  singlesWon: number
  singlesPlayed: number
  doublesWon: number
  doublesPlayed: number
}

const StatsMatchPerformance = ({
  stats,
  path,
}: {
  stats: StatType[]
  path: string | undefined
}) => {
  const router = useRouter()
  const currentPath = usePathname()
  
  // Determine the correct Match route path
  const getMatchPath = () => {
    // If path prop is provided, use it
    if (path) {
      return `${path}/Match`
    }
    
    // Otherwise, derive from current pathname
    if (currentPath.endsWith('/Player')) {
      // For statistics routes, handle special cases
      if (currentPath.includes('/statistics/')) {
        // Routes that have their own Match subdirectory
        if (currentPath.includes('/PlayerStatistics/Player')) {
          return '/statistics/PlayerStatistics/Match'
        }
        if (currentPath.includes('/TeamStatistics/Player')) {
          return '/statistics/TeamStatistics/Match'
        }
        if (currentPath.includes('/LeagueStandings/Player')) {
          return '/statistics/LeagueStandings/Match'
        }
        
        // Routes without Match subdirectory (like PlayerRankings) fall back to base
        return '/statistics/Match'
      }
      
      // For non-statistics routes, try replacing /Player with /Match
      return currentPath.replace('/Player', '/Match')
    }
    
    // Fallback: append /Match to current path
    return `${currentPath}/Match`
  }

  return (
    <View>
      {stats.map((stat: StatType, index: number) => {
        return (
          <View className="flex-row items-center" key={stat.date + '_' + index}>
            <View flex={3}>
              <Pressable
                style={{paddingVertical: 5}}
                onPress={() => {
                  const targetPath = getMatchPath()
                  console.log('Navigating to:', targetPath, 'with matchId:', stat.matchId)
                  router.push({
                    pathname: targetPath as any,
                    params: {params: JSON.stringify({matchId: stat.matchId})}
                  } as any)
                }}>
                <Text type="link">
                  {DateTime.fromISO(stat.date).toLocaleString(
                    DateTime.DATE_MED,
                  )}
                </Text>
              </Pressable>
            </View>
            <View flex={2} className="items-center">
              <Text>
                {stat.singlesWon}/{stat.singlesPlayed}
              </Text>
            </View>
            <View flex={3} className="items-end">
              <Text>
                {stat.doublesWon}/{stat.doublesPlayed}
              </Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default StatsMatchPerformance
