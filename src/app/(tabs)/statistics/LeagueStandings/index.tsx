/* eslint-disable react-hooks/exhaustive-deps */
import {ThemedView as View} from '@/components/ThemedView'
import {useNavigation} from '@react-navigation/native'
import {useTranslation} from 'react-i18next'
import React from 'react'
import {useLeague} from '@/hooks'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useState} from 'react'
import {FlatList} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import Row from '@/components/Row'
import {TouchableRipple} from 'react-native-paper'
import {router} from 'expo-router'
import type {Match, Team, DivisionData} from '@/types'

function MatchData({match}: {match: Match}) {
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
        <Text>{match.pts.toString()}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text>{match.frames.toString()}</Text>
      </View>
    </Row>
  )
}

function TeamStandings({team, idx}: {team: Team; idx: number}) {
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
          <Text>{team.played.toString()}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text>{team.points.toString()}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text>{team.frames.toString()}</Text>
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

function DivisionStandings({data}: {data: DivisionData}) {
  const {t} = useTranslation()
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
                {t('team')}
              </Text>
            </View>
            <View style={{flex: 1}} className="items-start">
              <Text type="default" className="font-bold">
                {t('played')}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text type="default" className="font-bold">
                {t('points')}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text type="default" className="font-bold">
                {t('frames')}
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
  const [standings, setStandings] = useState<DivisionData[]>([])
  const inset = useSafeAreaInsets()

  React.useEffect(() => {
    navigation.setOptions({
      title: t('league_standings'),
      headerBackTitle: t('back'),
    })
  }, [])

  React.useEffect(() => {
    league.GetStandings().then((standings: DivisionData[]) => {
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
