import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import Row from '@/components/Row'
import {ActivityIndicator, Pressable, useColorScheme, Alert} from 'react-native'
import {useTranslation} from 'react-i18next'
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
  const {t} = useTranslation()
  const homeStyle = `bg-red-400 dark:bg-red-600 mx-4 p-4 item-center rounded-lg`
  const awayStyle = `bg-blue-400 dark:bg-blue-600 mx-4 p-4 item-center rounded-lg`

  async function CanFinalize(side: string) {
    if (state.user.role_id === 9) {
      // return true
    }
    let validCount = 0
    matchState.frameData.forEach((frame: any) => {
      console.log(frame)
      // singles
      if (
        typeof frame.type === 'string' &&
        frame.type[frame.type.length - 1] === 's'
      ) {
        if (
          frame.awayPlayerIds.length === 1 &&
          frame.homePlayerIds.length === 1 &&
          frame.winner > 0
        ) {
          validCount++
        }
      } else if (
        typeof frame.type === 'string' &&
        frame.type[frame.type.length - 1] === 'd'
      ) {
        if (
          frame.awayPlayerIds.length === 2 &&
          frame.homePlayerIds.length === 2 &&
          frame.winner > 0
        ) {
          validCount++
        }
      }
    })
    return validCount === matchState.frameData.length
  }
  async function HandleFinalize(side: string) {
    try {
      if (await CanFinalize(side)) {
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
      } else {
        Alert.alert(t('error'), t('match_not_finalizable'))
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
        (state.user.teams?.some(
          (team: {id: number}) => team.id === matchInfo.home_team_id,
        ) ||
          state.user.role_id === 9) &&
        side === 'home'
      ) {
        UnfinalizeMatch(side, matchInfo.home_team_id)
      } else if (
        (state.user.teams?.some(
          (team: {id: number}) => team.id === matchInfo.away_team_id,
        ) ||
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
