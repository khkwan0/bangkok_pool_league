import React from 'react'
import {Pressable, Row, ScrollView, Text, View} from '@ybase'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useLeague, useYBase} from '~/lib/hooks'
import {useFocusEffect} from '@react-navigation/native'
import {useSelector} from 'react-redux'
import {Badge} from 'react-native-paper'

const Home = props => {
  const {colors} = useYBase()
  const user = useSelector(_state => _state.userData).user
  const league = useLeague()
  const [mergeRequestCount, setMergeRequestCount] = React.useState(0)

  async function GetActiveMergeRequestCount() {
    if (user.role_id === 9) {
      try {
        const res = await league.GetActiveMergeRequestCount()
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          setMergeRequestCount(res.data)
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      GetActiveMergeRequestCount()
    }, []),
  )

  return (
    <ScrollView
      contentContainerStyle={{flex: 1, backgroundColor: colors.background}}>
      <View flex={1} px={20} my={20}>
        <Pressable
          onPress={() => props.navigation.navigate('admin_teams')}
          my={20}>
          <Row alignItems="center">
            <View flex={1}>
              <Text bold fontSize="xxl">
                teams
              </Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
        <Pressable
          onPress={() => props.navigation.navigate('admin_divisions')}
          my={20}>
          <Row alignItems="center">
            <View flex={1}>
              <Text bold fontSize="xxl">
                divisions
              </Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
        <Pressable
          onPress={() => props.navigation.navigate('admin_seasons')}
          my={20}>
          <Row alignItems="center">
            <View flex={1}>
              <Text bold fontSize="xxl">
                seasons
              </Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
        <Pressable
          onPress={() => props.navigation.navigate('admin_merge_requests')}
          my={20}>
          <Row alignItems="center">
            <View flex={1}>
              <Row alignItesm="center" space={10}>
                <Text bold fontSize="xxl">
                  Merge Requests
                </Text>
                {mergeRequestCount > 0 && <Badge>{mergeRequestCount}</Badge>}
              </Row>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
        <Pressable
          onPress={() => props.navigation.navigate('admin_team_migrations')}
          my={20}>
          <Row alignItems="center">
            <View flex={1}>
              <Text bold fontSize="xxl">
                team migrations
              </Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
        <Pressable
          onPress={() => props.navigation.navigate('admin_login')}
          my={20}>
          <Row alignItems="center">
            <View flex={1}>
              <Text bold fontSize="xxl">
                Login As
              </Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
      </View>
    </ScrollView>
  )
}

export default Home
