import React from 'react'
import {Button, Row, Text, View} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'
import {FlatList} from 'react-native'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const Request = props => {
  const {colors} = useYBase()
  const league = useLeague()
  const request = props.request.item

  async function HandleAccept() {
    try {
      await league.AcceptMergeRequest(request.merge_request_id)
    } catch (e) {
      console.log(e)
    } finally {
      props.refresh()
    }
  }

  async function HandleDeny() {
    try {
      await league.DenyMergeRequest(request.merge_request_id)
    } catch (e) {
      console.log(e)
    } finally {
      props.refresh()
    }
  }

  return (
    <View px={20}>
      <Row alignItems="center">
        <View flex={1}>
          <Text>{request.merge_request_id}</Text>
        </View>
        <View flex={4}>
          <Row flex={1} alignItems="center">
            <View flex={1}>
              <Text bold fontSize="xl">
                #{request.player_id} {request.player_nickname}
              </Text>
            </View>
            <View flex={0.25}>
              <MCI name="transfer-right" color={colors.onSurface} size={30} />
            </View>
            <View flex={1}>
              <Text bold fontSize="xl">
                {' '}
                #{request.target_id} {request.target_name}
              </Text>
            </View>
          </Row>
        </View>
      </Row>
      <Row alignItems="center" space={20}>
        <View flex={1}>
          <Button onPress={() => HandleDeny()} variant="outline">
            Deny
          </Button>
        </View>
        <View flex={1}>
          <Button onPress={() => HandleAccept()}>Accept</Button>
        </View>
      </Row>
    </View>
  )
}

const RequestHeader = props => {
  const {colors} = useYBase()

  return (
    <View px={20} bgColor={colors.background} my={20}>
      <Row alignItems="center">
        <View flex={1}>
          <Text bold>Request ID</Text>
        </View>
        <View flex={4} alignItems="center">
          <Text bold>Request</Text>
        </View>
      </Row>
    </View>
  )
}
const MergeRequests = props => {
  const {colors} = useYBase()
  const [requests, setRequests] = React.useState([])
  const league = useLeague()

  async function GetMergeRequests() {
    try {
      const res = await league.GetMergeRequests()
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        setRequests(res.data)
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    GetMergeRequests()
  }, [])

  return (
    <FlatList
      style={{flexGrow: 1, backgroundColor: colors.background}}
      ListHeaderComponent={<RequestHeader />}
      data={requests}
      renderItem={(item, idx) => (
        <Request request={item} idx={idx} refresh={GetMergeRequests} />
      )}
    />
  )
}

export default MergeRequests
