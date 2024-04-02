import React from 'react'
import {Row, Text, View} from '@ybase'
import {Image, FlatList} from 'react-native'
import {useTeams, useYBase} from '~/lib/hooks'
import config from '~/config'

const StatsHeader = props => {
  return (
    <Row alignItems="center">
      <View flex={1}>
        <Text bold>rank</Text>
      </View>
      <View flex={1} />
      <View flex={2}>
        <Text bold>nickname</Text>
      </View>
      <View flex={1}>
        <Text bold>played</Text>
      </View>
      <View flex={1}>
        <Text bold>won</Text>
      </View>
      <View flex={1}>
        <Text bold>points</Text>
      </View>
    </Row>
  )
}

const Stat = props => {
  return (
    <Row alignItems="center" py={5}>
      <View flex={1}>
        <Text>{props.index + 1}</Text>
      </View>
      <View flex={1}>
        {props.item.profile_picture && (
          <View>
            <Image
              source={{uri: config.profileUrl + props.item.profile_picture}}
              width={30}
              height={30}
              resizeMode="contain"
              style={{borderRadius: 50}}
            />
          </View>
        )}
      </View>
      <View flex={2}>
        <Text>{props.item.nickname}</Text>
      </View>
      <View flex={1}>
        <Text>{props.item.played}</Text>
      </View>
      <View flex={1}>
        <Text>{props.item.won}</Text>
      </View>
      <View flex={1}>
        <Text>{props.item.points}</Text>
      </View>
    </Row>
  )
}
const TeamInternal = props => {
  const teamId = props.route.params.teamId
  const teamName = props.route.params.teamName
  const teams = useTeams()
  const [stats, setStats] = React.useState([])
  const {colors} = useYBase()

  async function GetTeamInternalStats() {
    try {
      const res = await teams.GetTeamInternalStats(teamId)
      setStats(res.data)
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    if (teamId) {
      GetTeamInternalStats()
    }
  }, [])

  React.useEffect(() => {
    props.navigation.setOptions({
      headerTitle: teamName,
    })
  }, [props.navigation])

  return (
    <FlatList
      style={{
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: colors.background,
      }}
      data={stats}
      ListHeaderComponent={<StatsHeader />}
      renderItem={({item, index}) => <Stat item={item} index={index} />}
    />
  )
}

export default TeamInternal
