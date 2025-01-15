import {Tabs} from 'expo-router'
import {Link} from 'expo-router'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {TabBarIcon} from '@/components/navigation/TabBarIcon'
import {Colors} from '@/constants/Colors'
import {useColorScheme, useThemeColor} from '@/hooks'
import {useTranslation} from 'react-i18next'

export default function TabLayout() {
  console.log('TabLayout')
  const colorScheme = useColorScheme()
  const {t} = useTranslation()
  const textColor = useThemeColor({}, 'text')

  return (
    <Tabs>
      <Tabs.Screen
        name="(index)"
        options={{
          headerTitle: t('bangkok_pool_league'),
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: t('statistics'),
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: t('completed'),
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'code-slash' : 'code-slash-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
/* 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerTitleStyle: {fontSize: 20},
        headerRight: () => (
          <Link href="/Settings">
            <MCI name="menu" color={textColor} size={30} />
          </Link>
        ),
      }}>
      <Tabs.Screen
        name="Upcoming"
        options={{
          title: t('upcoming_matches'),
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: t('statistics'),
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: t('completed'),
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'code-slash' : 'code-slash-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
*/
}
