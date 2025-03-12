import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import Row from '@/components/Row'
import {Pressable, useColorScheme} from 'react-native'
import {t} from 'i18next'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMatchContext} from '@/context/MatchContext'

export default function Finalizer({matchInfo}: {matchInfo: any}) {
  const colorScheme = useColorScheme()
  const {FinalizeMatch}: any = useMatchContext()
  const {state} = useLeagueContext()
  console.log(state.user.teams)

  const backgroundTint = colorScheme === 'dark' ? '600' : '300'
  const red = `bg-red-${backgroundTint}`
  const blue = `bg-blue-${backgroundTint}`
  const homeStyle = `${red} mx-4 p-4 item-center rounded`
  const awayStyle = `${blue} mx-4 p-4 item-center rounded`

  console.log(matchInfo)

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

  return (
    <View>
      <Row>
        <View flex={1}>
          <Pressable
            className={homeStyle}
            onPress={() => HandleFinalize('home')}>
            <Text className="text-center" type="subtitle">
              {t('finalize')} {t('home')}
            </Text>
          </Pressable>
        </View>
        <View flex={1}>
          <Pressable
            className={awayStyle}
            onPress={() => HandleFinalize('away')}>
            <Text className="text-center" type="subtitle">
              {t('finalize')} {t('away')}
            </Text>
          </Pressable>
        </View>
      </Row>
    </View>
  )
}
