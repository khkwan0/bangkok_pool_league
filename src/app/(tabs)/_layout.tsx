import {Tabs} from 'expo-router'
import {TabBarIcon} from '@/components/navigation/TabBarIcon'
import {useTranslation} from 'react-i18next'

export default function TabLayout() {
  const {t} = useTranslation()

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
          tabBarLabel: t('home'),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: t('statistics'),
          headerShown: false,
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
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'code-slash' : 'code-slash-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: t('teams'),
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? 'people' : 'people-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}
