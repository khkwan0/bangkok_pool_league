/* eslint-disable react-hooks/exhaustive-deps */
import StatsDoubles from '@/components/PlayerStatistics/StatsDoubles'
import StatsHeader from '@/components/PlayerStatistics/StatsHeader'
import StatsMatchPerformance from '@/components/PlayerStatistics/StatsMatchPerformance'
import Row from '@/components/Row'
import Stats from '@/components/Stats'
import { ThemedText as Text } from '@/components/ThemedText'
import { ThemedView as View } from '@/components/ThemedView'
import config from '@/config'
import { useSeason } from '@/hooks/useSeason'
import { useTabListContentContainerStyle } from '@/hooks/useTabListContentContainerStyle'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, RefreshControl, ScrollView } from 'react-native'

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
  path: string | undefined
}) {
  const season = useSeason()
  const [stats, setStats] = useState<any>(null)
  const [doublesStats, setDoublesStats] = useState<any>(null)
  const [matchPerformance, setMatchPerformance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDoubleStatsLoading, setIsDoubleStatsLoading] = useState(false)
  const [isMatchPerformanceLoading, setIsMatchPerformanceLoading] =
    useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const {t} = useTranslation()
  const listContentStyle = useTabListContentContainerStyle({
    flexGrow: 1,
    padding: 20,
  })

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true)
  }, [playerInfo.player_id])

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
        setIsRefreshing(false)
      }
    })()
  }, [playerInfo.player_id, isRefreshing])

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
        setIsRefreshing(false)
      }
    })()
  }, [playerInfo.player_id, isRefreshing])

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
        setIsRefreshing(false)
      }
    })()
  }, [playerInfo.player_id, isRefreshing])

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
    <ScrollView
      contentContainerStyle={listContentStyle}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          progressBackgroundColor="#000"
        />
      }>
      <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
        <Row className="items-center">
          <View style={{flex: 3}}>
            <Text type="title" className="mb-2">
              {playerInfo.name || t('player_profile')}
            </Text>
            <View className="space-y-1">
              <Text
                type="subtitle"
                className="text-gray-600 dark:text-gray-400">
                {playerInfo.flag}{' '}
                {playerInfo.nationality?.en || t('not_provided')}
              </Text>
              <Text
                type="subtitle"
                className="text-gray-600 dark:text-gray-400">
                {t('player_id')}: {playerInfo.player_id}
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
          <Text>{t('loading_singles_statistics')}</Text>
        </View>
      ) : (
        stats && (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <Text type="title" className="mb-4">
              {t('singles_performance')}
            </Text>
            <StatsHeader isDoubles={false} isMatchPerformance={false} />
            <Stats stats={stats} />
          </View>
        )
      )}

      {/* Doubles Statistics */}
      {isDoubleStatsLoading ? (
        <View className="p-6">
          <Text>{t('loading_doubles_statistics')}</Text>
        </View>
      ) : (
        doublesStats && (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <Text type="title" className="mb-4">
              {t('doubles_performance')}
            </Text>
            <StatsHeader isDoubles={true} isMatchPerformance={false} />
            <StatsDoubles stats={doublesStats} path={path} />
          </View>
        )
      )}

      {/* Match Performance */}
      {isMatchPerformanceLoading ? (
        <View className="p-6">
          <Text>{t('loading_match_performance')}</Text>
        </View>
      ) : (
        matchPerformance && (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <Text type="title" className="mb-4">
              {t('match_performance')}
            </Text>
            <StatsHeader isDoubles={false} isMatchPerformance={true} />
            <StatsMatchPerformance stats={matchPerformance} path={path} />
          </View>
        )
      )}

      {/* Statistics Legend */}
      <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <Text type="subtitle" className="mb-2">
          {t('statistics_legend')}
        </Text>
        <View className="space-y-2">
          <Text className="text-gray-600 dark:text-gray-400">
            {t('statistics_legend_confirmed')}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {t('statistics_legend_weighted')}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {t('statistics_legend_adjusted')}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
