/* eslint-disable react-hooks/exhaustive-deps */
import Row from '@/components/Row'
import {RankingScoreInfoButton} from '@/components/Statistics/RankingScoreInfo'
import StatsScopeChips from '@/components/Statistics/StatsScopeChips'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {MiniSeasonChips} from '@/components/mini-leagues/MiniSeasonChips'
import {useStatsScope} from '@/context/StatsScopeContext'
import {useLeagueSeasonSelection} from '@/hooks/useLeagueSeasonSelection'
import {useNetwork} from '@/hooks/useNetwork'
import {useTabListContentContainerStyle} from '@/hooks/useTabListContentContainerStyle'
import {router, usePathname} from 'expo-router'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {ActivityIndicator, FlatList, Pressable} from 'react-native'

type PlayerRanking = {
  playerId: number
  nickname: string
  profile_picture?: string
  played: number
  won: number
  points: number
  win_percentage?: number
  winRatio?: number
  winRatioDisp?: string
  score?: number
  scoreDisp?: string
  rank?: number
}

type DivisionPlayerRankings = {
  division_id: number
  division_name: string
  players: PlayerRanking[]
}

function formatPoints(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function PlayerRow({
  player,
  index,
}: {
  player: PlayerRanking
  index: number
}) {
  const currentPath = usePathname()

  function handlePress(playerId: number) {
    router.push({
      pathname: (currentPath + '/Player') as any,
      params: {
        params: JSON.stringify({playerId}),
      },
    })
  }

  const score =
    player.scoreDisp ??
    player.winRatioDisp ??
    (player.score !== undefined
      ? player.score.toFixed(2)
      : player.winRatio !== undefined
        ? player.winRatio.toFixed(2)
        : '0.00')

  return (
    <Pressable
      onPress={() => handlePress(player.playerId)}
      className="flex-row items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700">
      <View style={{flex: 1}}>
        <Text className="font-medium">#{index + 1}</Text>
      </View>
      <View style={{flex: 4}}>
        <Text className="font-medium">{player.nickname}</Text>
      </View>
      <View style={{flex: 1}} className="items-center">
        <Text>{formatPoints(player.played)}</Text>
      </View>
      <View style={{flex: 1}} className="items-center">
        <Text>{formatPoints(player.won)}</Text>
      </View>
      <View style={{flex: 1}} className="items-center">
        <Text>{score}</Text>
      </View>
    </Pressable>
  )
}

function DivisionRankings({data}: {data: DivisionPlayerRankings}) {
  const {t} = useTranslation()

  if (data.players.length === 0) {
    return null
  }

  return (
    <View className="mb-6">
      <View className="px-4 py-3 bg-gray-100 dark:bg-gray-800">
        <Text type="title" className="text-lg font-bold">
          {data.division_name}
        </Text>
      </View>
      <View className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
        <Row alignItems="center">
          <View style={{flex: 0.5}} />
          <View style={{flex: 4}}>
            <Text className="font-bold text-sm">{t('player')}</Text>
          </View>
          <View style={{flex: 1}} className="items-center">
            <Text className="font-bold text-sm">{t('played')}</Text>
          </View>
          <View style={{flex: 1}} className="items-center">
            <Text className="font-bold text-sm">{t('won')}</Text>
          </View>
          <View style={{flex: 1}} className="items-center">
            <Text className="font-bold text-sm">{t('score')}</Text>
          </View>
        </Row>
      </View>
      <FlatList
        data={data.players}
        renderItem={({item, index}) => (
          <PlayerRow player={item} index={index} />
        )}
        scrollEnabled={false}
      />
    </View>
  )
}

export default function PlayerRankings({
  season,
  divisionId,
}: {
  season?: number
  divisionId?: number
}) {
  const {t} = useTranslation()
  const {Get} = useNetwork()
  const {scope} = useStatsScope()
  const [rankings, setRankings] = useState<DivisionPlayerRankings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const listContentStyle = useTabListContentContainerStyle({paddingTop: 10})
  const {seasons, seasonId, setSeasonId, pastSeasonId} =
    useLeagueSeasonSelection(season)
  const effectiveSeason = seasons.length > 0 ? pastSeasonId : season

  React.useEffect(() => {
    async function fetchRankings() {
      try {
        setIsLoading(true)
        setError(null)

        const queryParams: string[] = [`scope=${scope}`]
        if (effectiveSeason !== undefined && effectiveSeason !== null) {
          queryParams.push(`season=${effectiveSeason}`)
        }
        if (divisionId !== undefined && divisionId !== null) {
          queryParams.push(`division_id=${divisionId}`)
        }

        const queryString = '?' + queryParams.join('&')
        const endpoint = `/league/0/division/players/stats${queryString}`

        const res = await Get(endpoint)

        if (!res || (typeof res === 'object' && Object.keys(res).length === 0)) {
          console.warn(
            'Empty response from API - endpoint may not exist or returned error',
          )
          setError(
            'No data available. The API endpoint may not be available or returned an error.',
          )
          setRankings([])
          return
        }

        if (res && res.status === 'ok' && res.data) {
          const _rankings = Object.keys(res.data).map(key => ({
            division_name: key,
            players: res.data[key],
          }))
          setRankings(_rankings as DivisionPlayerRankings[])
          if (_rankings.length === 0) {
            setError('No player rankings found for the selected criteria.')
          }
        }
      } catch (e) {
        console.error('Failed to fetch player rankings:', e)
        const errorMessage =
          e instanceof Error ? e.message : 'Failed to load data'
        setError(errorMessage)
        setRankings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRankings()
  }, [effectiveSeason, divisionId, scope])

  return (
    <View className="flex-1">
      <View className="px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 8,
          }}>
          <View style={{flex: 1}}>
            <StatsScopeChips />
            <MiniSeasonChips
              seasons={seasons}
              seasonId={seasonId}
              onSelect={setSeasonId}
            />
          </View>
          <RankingScoreInfoButton size={22} />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4">{t('loading') || 'Loading...'}</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center mb-2">{error}</Text>
          <Text className="text-gray-500 text-center text-sm">
            Please check the console for more details.
          </Text>
        </View>
      ) : rankings.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-center mb-2">
            {t('no_data_available') || 'No data available'}
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            Try adjusting the season or division filters.
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={listContentStyle}
          data={rankings}
          renderItem={({item}) => <DivisionRankings data={item} />}
          keyExtractor={(item, index) =>
            `division-${item.division_id || index}`
          }
        />
      )}
    </View>
  )
}
