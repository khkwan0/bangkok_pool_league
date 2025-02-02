import {StyleSheet} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {router} from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import {ThemedText as Text} from '@/components/ThemedText'
import { useTranslation } from 'react-i18next'

export default function StatisticsHome(props: any) {
  const { t } = useTranslation()
  
  return (
    <View style={styles.container}>
          <View className="my-4">
            <Button icon={<Ionicons name="trophy" size={24} color="#FFD700" />} onPress={() => router.push('/statistics/LeagueStandings')}>{t('league_standings')}</Button>
          </View>
          <View className="my-4">
            <Button icon={<Ionicons name="people" size={24} color="#4CAF50" />} onPress={() => router.push('/statistics/TeamStatistics')}>{t('team_statistics')}</Button>
          </View>
          <View className="my-4">
            <Button icon={<Ionicons name="person" size={24} color="#2196F3" />} onPress={() => router.push('/statistics/PlayerStatistics')}>{t('player_statistics')}</Button>
          </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
})
