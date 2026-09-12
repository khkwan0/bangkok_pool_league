import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {useTheme} from 'expo-router/react-navigation'
import React from 'react'
import {ActivityIndicator, ScrollView} from 'react-native'

export function MiniLeagueStats({miniLeagueId}: {miniLeagueId: number}) {
  const api = useMiniLeagues()
  const {colors} = useTheme()
  const [standings, setStandings] = React.useState<any[]>([])
  const [playerStats, setPlayerStats] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [s, p] = await Promise.all([
        api.standings(miniLeagueId),
        api.playerStats(miniLeagueId),
      ])
      if (cancelled) return
      if (s?.status === 'ok') setStandings(s.data || [])
      if (p?.status === 'ok') setPlayerStats(p.data || [])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [miniLeagueId])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1"
      style={{backgroundColor: colors.background}}
      contentContainerStyle={{padding: 16, paddingBottom: 40}}>
      <Text className="text-lg font-semibold mb-3">Standings</Text>
      {standings.length === 0 ? (
        <Text className="opacity-60 mb-6">No standings yet.</Text>
      ) : (
        standings.map(div => (
          <View key={div.division} className="mb-4">
            <Text className="font-semibold mb-2">{div.division}</Text>
            {(div.teams || []).map((t: any, idx: number) => (
              <Text key={t.teamId} className="py-1">
                {idx + 1}. {t.name} — {t.points} pts, {t.frames} frames (
                {t.played} played)
              </Text>
            ))}
          </View>
        ))
      )}

      <Text className="text-lg font-semibold mt-4 mb-3">Player stats</Text>
      {playerStats.length === 0 ? (
        <Text className="opacity-60">No player stats yet.</Text>
      ) : (
        playerStats.map(p => (
          <Text key={p.player_id} className="py-2">
            {p.nickname}: {p.won}/{p.played} ({p.winp}%)
          </Text>
        ))
      )}
    </ScrollView>
  )
}
