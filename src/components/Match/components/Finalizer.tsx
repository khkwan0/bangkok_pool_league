import Row from '@/components/Row'
import {
  ActivityIndicator,
  Pressable,
  useColorScheme,
  Alert,
  Text,
  View,
  StyleSheet,
} from 'react-native'
import {useTranslation} from 'react-i18next'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMatchContext} from '@/context/MatchContext'
import React from 'react'
import {LinearGradient} from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

function FinalizedButton() {
  return (
    <LinearGradient
      colors={['gold', 'white', 'gold']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Finalized</Text>
    </LinearGradient>
  )
}
export default function Finalizer({matchInfo}: {matchInfo: any}) {
  const colorScheme = useColorScheme()
  const {
    state: matchState,
    FinalizeMatch,
    UnfinalizeMatch,
  }: any = useMatchContext()
  const {state} = useLeagueContext()
  const [homeLoading, setHomeLoading] = React.useState(false)
  const [awayLoading, setAwayLoading] = React.useState(false)
  const {t} = useTranslation()
  const homeStyle = `bg-red-400 dark:bg-red-600 mx-4 p-4 items-center rounded-lg`
  const awayStyle = `bg-blue-400 dark:bg-blue-600 mx-4 p-4 item-center rounded-lg`

  async function CanFinalize(side: string) {
    let validCount = 0
    let frameCount = 0
    matchState.frameData.forEach((frame: any) => {
      if (frame.frameNumber !== -1) {
        frameCount++
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
          } else {
            // console.log(frame.frameNumber, frame.type)
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
      }
    })
    return validCount === frameCount
  }
  async function HandleFinalize(side: string) {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      if (await CanFinalize(side)) {
        if (
          (state.user.teams?.some(
            (team: {id: number}) => team.id === matchState.matchInfo.home_team_id,
          ) ||
            state.user.role_id === 9) &&
          side === 'home'
        ) {
          setHomeLoading(true)
          FinalizeMatch(side, matchState.matchInfo.home_team_id)
        } else if (
          (state.user.teams?.some(
            (team: {id: number}) => team.id === matchState.matchInfo.away_team_id,
          ) ||
            state.user.role_id === 9) &&
          side === 'away'
        ) {
          setAwayLoading(true)
          FinalizeMatch(side, matchState.matchInfo.away_team_id)
        } else {
          Alert.alert(t('error'), t('not_on_team') + ' ' + side + ' ' + matchInfo.home_team_id + ' ' + JSON.stringify(state.user.teams))
        }
      } else {
        Alert.alert(t('error'), t('match_not_finalizable'))
        setHomeLoading(false)
        setAwayLoading(false)
      }
    } catch (e) {
      console.log(e)
      setHomeLoading(false)
      setAwayLoading(false)
    }
  }

  function Unfinalize(side: string) {
    try {
      if (
        (state.user.teams?.some(
          (team: {id: number}) => team.id === matchInfo.home_team_id,
        ) ||
          state.user.role_id === 9) &&
        side === 'home'
      ) {
        setHomeLoading(true)
        UnfinalizeMatch(side, matchInfo.home_team_id)
      } else if (
        (state.user.teams?.some(
          (team: {id: number}) => team.id === matchInfo.away_team_id,
        ) ||
          state.user.role_id === 9) &&
        side === 'away'
      ) {
        setAwayLoading(true)
        UnfinalizeMatch(side, matchInfo.away_team_id)
      }
    } catch (e) {
      console.log(e)
      setHomeLoading(false)
      setAwayLoading(false)
    }
  }

  React.useEffect(() => {
    setHomeLoading(false)
  }, [matchState.finalizedHome])

  React.useEffect(() => {
    setAwayLoading(false)
  }, [matchState.finalizedAway])

  return (
    <View>
      <Row>
        <View className="flex-1">
          {homeLoading ? (
            <ActivityIndicator
              className="mx-4 p-4"
              size="small"
              color={colorScheme === 'dark' ? 'white' : 'black'}
            />
          ) : matchState.finalizedHome ? (
            <Pressable
              onPress={() => Unfinalize('home')}
              className="rounded-lg mx-4 items-center rounded-lg">
              <LinearGradient
                colors={['gold', 'white', 'gold']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{padding: 14, width: '100%', borderRadius: 8}}>
                <Text className="text-center text-black font-bold text-lg">
                  {t('unfinalize')}
                  &nbsp;{t('home')}
                </Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              disabled={homeLoading}
              className={homeStyle}
              onPress={() => HandleFinalize('home')}>
              <Text className="text-center text-white font-bold text-lg">
                {t('finalize')}
                &nbsp;{t('home')}
              </Text>
            </Pressable>
          )}
        </View>
        <View className="flex-1">
          {awayLoading ? (
            <ActivityIndicator
              className="mx-4 p-4"
              size="small"
              color={colorScheme === 'dark' ? 'white' : 'black'}
            />
          ) : matchState.finalizedAway ? (
            <Pressable
              onPress={() => Unfinalize('away')}
              className="rounded-lg mx-4 items-center rounded-lg">
              <LinearGradient
                colors={['gold', 'white', 'gold']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{padding: 14, width: '100%', borderRadius: 8}}>
                <Text className="text-center text-black font-bold text-lg">
                  {t('unfinalize')}
                  &nbsp;{t('away')}
                </Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              disabled={awayLoading}
              className={awayStyle}
              onPress={() => HandleFinalize('away')}>
              <Text className="text-center text-white font-bold text-lg">
                {t('finalize')}
                &nbsp;{t('away')}
              </Text>
            </Pressable>
          )}
        </View>
      </Row>
    </View>
  )
}
