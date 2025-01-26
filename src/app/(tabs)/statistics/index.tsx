import { ImageBackground, Pressable, StyleSheet } from 'react-native'
import { ThemedView as View } from '@/components/ThemedView'
import { ThemedText as Text } from '@/components/ThemedText'
import { router } from 'expo-router'
import { Link } from 'expo-router'
import { useNavigation } from '@react-navigation/native'

export default function StatisticsHome(props: any) {
  const navigation = useNavigation()

  function ShowTeamStats() {
    router.push('/TeamStatistics')
  }

  function ShowPlayerStats() {
    router.push('/PlayerStatistics')
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/img/bgs/bkkpool_logo.png')}
        style={styles.backgroundImage}
        resizeMode="contain">
        <View style={styles.overlay}>
          <Link href={{ pathname: '/statistics/LeagueStandings' }} asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>League Standings</Text>
            </Pressable>
          </Link>
          <Link href={{ pathname: '/statistics/TeamStatistics' }} asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Team Statistics</Text>
            </Pressable>
          </Link>
          <Link href={{ pathname: '/statistics/PlayerStatistics' }} asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Player Statistics</Text>
            </Pressable>
          </Link>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: undefined,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  button: {
    padding: 16,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007BFF', // Primary button color
    width: '80%',
    alignItems: 'center',
    elevation: 3, // Shadow effect
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
