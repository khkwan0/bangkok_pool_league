import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import Row from '@/components/Row'
import {Pressable, useColorScheme} from 'react-native'
import {t} from 'i18next'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMatchContext} from '@/context/MatchContext'

export default function Finalizer({matchInfo}: {matchInfo: any}) {
  const colorScheme = useColorScheme()
  const {
    state: matchState,
    FinalizeMatch,
    UnfinalizeMatch,
  }: any = useMatchContext()
  const {state} = useLeagueContext()

  const backgroundTint = colorScheme === 'dark' ? '600' : '300'
  const red = `bg-red-${backgroundTint}`
  const blue = `bg-blue-${backgroundTint}`
  const homeStyle = `${red} mx-4 p-4 item-center rounded`
  const awayStyle = `${blue} mx-4 p-4 item-center rounded`

  async function HandleFinalize(side: string) {
    if (
      (state.user.teams?.includes(matchInfo.home_team_id) ||
        state.user.role_id === 9) &&
      side === 'home'
    ) {
      FinalizeMatch(side, matchInfo.home_team_id)
    } else if (
      (state.user.teams?.includes(matchInfo.away_team_id) ||
        state.user.role_id === 9) &&
      side === 'away'
    ) {
      FinalizeMatch(side, matchInfo.away_team_id)
    }
  }

  function Unfinalize(side: string) {
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
  }
  

  return (
    <View>
      <Row>
        <View flex={1}>
          <Pressable
            className={homeStyle}
            onPress={() =>
              matchState.finalizedHome
                ? Unfinalize('home')
                : HandleFinalize('home')
            }>
            <Text className="text-center" type="subtitle">
              {matchState.finalizedHome ? t('unfinalize') : t('finalize')}
              {t('home')}
            </Text>
          </Pressable>
        </View>
        <View flex={1}>
          <Pressable
            className={awayStyle}
            onPress={() =>
              matchState.finalizedAway
                ? Unfinalize('away')
                : HandleFinalize('away')
            }>
            <Text className="text-center" type="subtitle">
              {matchState.finalizedAway ? t('unfinalize') : t('finalize')}
              {t('away')}
            </Text>
          </Pressable>
        </View>
      </Row>
    </View>
  )
}
