import {useSeason} from '@/hooks/useSeason'
import {useState} from 'react'
import React from 'react'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import Row from '@/components/Row'
import {Image, ScrollView} from 'react-native'
import config from '@/app/config'
import StatsHeader from '@/components/PlayerStatistics/StatsHeader'
import Stats from '@/components/Stats'
import StatsDoubles from '@/components/PlayerStatistics/StatsDoubles'
import StatsMatchPerformance from '@/components/PlayerStatistics/StatsMatchPerformance'

interface PlayerInfo {
  player_id: number
  name?: string
  firstname?: string
  lastname?: string
  nationality?: {en: string}
  flag?: string
  profile_picture?: string
  gender?: string
  pic?: string | null
}

export default function PlayerStatistics({
  playerInfo,
  path,
}: {
  playerInfo: PlayerInfo
  path: string
}) {
  const season = useSeason()
  const [stats, setStats] = useState<any>(null)
  const [doublesStats, setDoublesStats] = useState<any>(null)
  const [matchPerformance, setMatchPerformance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDoubleStatsLoading, setIsDoubleStatsLoading] = useState(false)
  const [isMatchPerformanceLoading, setIsMatchPerformanceLoading] =
    useState(false)

  React.useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const res = await GetStats()
        setStats(res)
      } catch (e) {
        console.log(e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [playerInfo.player_id])

  React.useEffect(() => {
    ;(async () => {
      try {
        setIsDoubleStatsLoading(true)
        const res = await GetDoublesStats()
        setDoublesStats(res)
      } catch (e) {
        console.log(e)
      } finally {
        setIsDoubleStatsLoading(false)
      }
    })()
  }, [playerInfo.player_id])

  React.useEffect(() => {
    ;(async () => {
      try {
        setIsMatchPerformanceLoading(true)
        const res = await GetMatchPerformance()
        setMatchPerformance(res)
      } catch (e) {
        console.log(e)
      } finally {
        setIsMatchPerformanceLoading(false)
      }
    })()
  }, [playerInfo.player_id])

  async function GetStats() {
    try {
      const res = await season.GetPlayerStats(playerInfo.player_id)
      return res
    } catch (e) {
      console.log(e)
      throw new Error(e as string)
    }
  }

  async function GetDoublesStats() {
    try {
      const res = await season.GetDoublesStats(playerInfo.player_id)
      return res
    } catch (e) {
      console.log(e)
      throw new Error(e as string)
    }
  }

  async function GetMatchPerformance() {
    try {
      const res = await season.GetMatchPerformance(playerInfo.player_id)
      return res
    } catch (e) {
      console.log(e)
      throw new Error(e as string)
    }
  }

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1, padding: 20}}>
      <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
        <Row className="items-center">
          <View style={{flex: 3}}>
            <Text type="title" className="mb-2">
              {playerInfo.name || 'Player Profile'}
            </Text>
            <View className="space-y-1">
              <Text
                type="subtitle"
                className="text-gray-600 dark:text-gray-400">
                {playerInfo.flag} {playerInfo.nationality?.en || 'not_provided'}
              </Text>
              <Text
                type="subtitle"
                className="text-gray-600 dark:text-gray-400">
                Player ID: {playerInfo.player_id}
              </Text>
            </View>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Image
              source={{
                uri: `${config.profileUrl}${
                  playerInfo.pic ||
                  (playerInfo.gender === 'Female'
                    ? 'default_female.png'
                    : 'default_male.png')
                }`,
              }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
              }}
              resizeMode="contain"
            />
          </View>
        </Row>
      </View>
      {/* Singles Statistics */}
      {isLoading ? (
        <View className="p-6">
          <Text>Loading singles statistics...</Text>
        </View>
      ) : (
        stats && (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <StatsHeader isDoubles={false} isMatchPerformance={false} />
            <Stats stats={stats} />
          </View>
        )
      )}

      {/* Doubles Statistics */}
      {isDoubleStatsLoading ? (
        <View className="p-6">
          <Text>Loading doubles statistics...</Text>
        </View>
      ) : (
        doublesStats && (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <StatsHeader isDoubles={true} isMatchPerformance={false} />
            <StatsDoubles stats={doublesStats} />
          </View>
        )
      )}

      {/* Match Performance */}
      {isMatchPerformanceLoading ? (
        <View className="p-6">
          <Text>Loading match performance...</Text>
        </View>
      ) : (
        matchPerformance && (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <Text type="title" className="mb-4">
              Match Performance
            </Text>
            <StatsHeader isDoubles={false} isMatchPerformance={true} />
            <StatsMatchPerformance stats={matchPerformance} path={path} />
          </View>
        )
      )}

      {/* Statistics Legend */}
      <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <Text type="subtitle" className="mb-2">
          Statistics Legend
        </Text>
        <View className="space-y-2">
          <Text className="text-gray-600 dark:text-gray-400">
            • All performance figures are based on confirmed matches only
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            • Weighted performance: Doubles frames are weighted with 50% weight
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            • Adjusted performance: The overall weighted performance is
            multiplied by (frames-1)/frames to account for small sample sizes
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
