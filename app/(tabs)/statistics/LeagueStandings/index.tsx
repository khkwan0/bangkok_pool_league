import {ThemedView as View} from '@/components/ThemedView'
import {useNavigation} from '@react-navigation/native'
import {useTranslation} from 'react-i18next'
import React from 'react'
import {useLeague} from '@/hooks'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useState} from 'react'
import {FlatList} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {useThemeColor} from '@/hooks/useThemeColor'
import Row from '@/components/Row'
import {TouchableRipple} from 'react-native-paper'
import {router} from 'expo-router'

function MatchData({match}) {
  return (
    <Row alignItems="center">
      <View style={{flex: 1}} className="items-center">
        <Text>{match.home ? 'H' : 'A'}</Text>
      </View>
      <View style={{flex: 4}}>
        <TouchableRipple
          onPress={() =>
            router.push({
              pathname: '/Completed/Match',
              params: {
                params: JSON.stringify(match),
              },
            })
          }>
          <Text type="default" className="py-2">
            {match.vs}
          </Text>
        </TouchableRipple>
      </View>
      <View style={{flex: 1}}>
        <Text>{match.pts}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text>{match.frames}</Text>
      </View>
    </Row>
  )
}

function TeamStandings({team, idx}) {
  const [showAll, setShowAll] = React.useState(false)
  return (
    <View className="px-4">
      <Row alignItems="center">
        <View style={{flex: 4}}>
          <TouchableRipple onPress={() => setShowAll(s => !s)}>
            <View className="py-2">
              <Text type="default" className="font-bold text-xl">
                {idx}&nbsp;
                {team.name}
              </Text>
            </View>
          </TouchableRipple>
        </View>
        <View style={{flex: 1}}>
          <Text>{team.played}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text>{team.points}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text>{team.frames}</Text>
        </View>
      </Row>
      {showAll && (
        <FlatList
          data={team.matches}
          renderItem={({item, index}) => <MatchData match={item} />}
        />
      )}
    </View>
  )
}
function DivisionStandings({data}) {
  return (
    <FlatList
      ListHeaderComponent={
        <View className="px-4 mt-2">
          <View>
            <Text type="title">{data.division}</Text>
          </View>
          <Row alignItems="center">
            <View style={{flex: 4}} className="items-center">
              <Text type="default" className="font-bold">
                Team
              </Text>
            </View>
            <View style={{flex: 1}} className="items-start">
              <Text type="default" className="font-bold">
                Plyd
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text type="default" className="font-bold">
                Pts
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text type="default" className="font-bold">
                Frms
              </Text>
            </View>
          </Row>
        </View>
      }
      data={data.teams}
      renderItem={({item, index}) => (
        <TeamStandings team={item} idx={index + 1} />
      )}
    />
  )
}

export default function LeagueStandings() {
  const navigation = useNavigation()
  const {t} = useTranslation()
  const league = useLeague()
  const [standings, setStandings] = useState([])
  const inset = useSafeAreaInsets()

  React.useEffect(() => {
    navigation.setOptions({
      title: t('league_standings'),
      headerBackTitle: t('back'),
    })
  }, [])

  React.useEffect(() => {
    league.GetStandings().then((standings) => {
      setStandings(standings)
    })
  }, [])

  return (
    <FlatList
      contentContainerStyle={{paddingBottom: inset.bottom}}
      data={standings}
      renderItem={({item}) => <DivisionStandings data={item} />}
    />
  )
}
