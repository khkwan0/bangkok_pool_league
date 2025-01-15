import {ImageBackground, Pressable} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {router} from 'expo-router'
import {Link} from 'expo-router'
import {useNavigation} from '@react-navigation/native'

export default function StatisticsHome(props: any) {
  const navigation = useNavigation()

  function ShowTeamStats() {
    router.push('/TeamStatistics')
  }

  function ShowPlayerStats() {
    router.push('/PlayerStatistics')
  }

  console.log(navigation.getState())

  return (
    <View flex={1}>
      <ImageBackground
        source={require('@/assets/img/bgs/bkkpool_logo.png')}
        style={{flex: 1, width: '100%', height: '100%'}}
        resizeMode="cover">
        <Link href={{pathname: '/statistics/LeagueStandings'}} asChild>
          <Pressable
            className="items-center justify-center"
            style={{flex: 1, backgroundColor: '#000b'}}>
            <Text type="title">league_standings</Text>
          </Pressable>
        </Link>
      </ImageBackground>
      <ImageBackground
        source={require('@/assets/img/bgs/team.png')}
        style={{flex: 1, width: '100%', height: '100%', marginTop: 2}}
        resizeMode="cover">
        <Link href={{pathname: '/statistics/TeamStatistics'}} asChild>
          <Pressable
            className="items-center justify-center"
            style={{flex: 1, backgroundColor: '#000b'}}>
            <Text type="title">team_statistics</Text>
          </Pressable>
        </Link>
      </ImageBackground>
      <ImageBackground
        source={require('@/assets/img/bgs/su.png')}
        style={{flex: 1, width: '100%', height: '100%', marginTop: 2}}
        resizeMode="cover">
        <Link href={{pathname: '/statistics/PlayerStatistics'}} asChild>
          <Pressable
            className="items-center justify-center"
            style={{flex: 1, backgroundColor: '#000b'}}>
            <Text type="title">player_statistics</Text>
          </Pressable>
        </Link>
      </ImageBackground>
    </View>
  )
}
