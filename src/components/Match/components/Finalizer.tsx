import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import Row from '@/components/Row'
import {ActivityIndicator, Pressable, useColorScheme} from 'react-native'
import {t} from 'i18next'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMatchContext} from '@/context/MatchContext'
import React from 'react'

export default function Finalizer({matchInfo}: {matchInfo: any}) {
  const colorScheme = useColorScheme()
  const {
    state: matchState,
    FinalizeMatch,
    UnfinalizeMatch,
  }: any = useMatchContext()
  const {state} = useLeagueContext()
  const [loading, setLoading] = React.useState(false)

  const homeStyle = `bg-red-400 dark:bg-red-600 mx-4 p-4 item-center rounded-lg`
  const awayStyle = `bg-blue-400 dark:bg-blue-600 mx-4 p-4 item-center rounded-lg`

  async function HandleFinalize(side: string) {
    try {
      setLoading(true)
      if (
        (state.user.teams?.some(
          (team: {id: number}) => team.id === matchInfo.home_team_id,
        ) ||
          state.user.role_id === 9) &&
        side === 'home'
      ) {
        FinalizeMatch(side, matchInfo.home_team_id)
      } else if (
        (state.user.teams?.some(
          (team: {id: number}) => team.id === matchInfo.away_team_id,
        ) ||
          state.user.role_id === 9) &&
        side === 'away'
      ) {
        FinalizeMatch(side, matchInfo.away_team_id)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  function Unfinalize(side: string) {
    try {
      setLoading(true)
      if (
        (state.user.teams?.includes(matchInfo.home_team_id) ||
          state.user.role_id === 9) &&
        side === 'home'
      ) {
        UnfinalizeMatch(side, matchInfo.home_team_id)
      } else if (
        (state.user.teams?.includes(matchInfo.away_team_id) ||
          state.user.role_id === 9) &&
        side === 'away'
      ) {
        UnfinalizeMatch(side, matchInfo.away_team_id)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View>
      <Row>
        <View flex={1}>
          <Pressable
            disabled={loading}
            className={homeStyle}
            onPress={() =>
              matchState.finalizedHome
                ? Unfinalize('home')
                : HandleFinalize('home')
            }>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            ) : (
              <Text className="text-center" type="subtitle">
                {matchState.finalizedHome ? t('unfinalize') : t('finalize')}
                &nbsp;{t('home')}
              </Text>
            )}
          </Pressable>
        </View>
        <View flex={1}>
          <Pressable
            disabled={loading}
            className={awayStyle}
            onPress={() =>
              matchState.finalizedAway
                ? Unfinalize('away')
                : HandleFinalize('away')
            }>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            ) : (
              <Text className="text-center" type="subtitle">
                {matchState.finalizedAway ? t('unfinalize') : t('finalize')}
                &nbsp;{t('away')}
              </Text>
            )}
          </Pressable>
        </View>
      </Row>
    </View>
  )
}
