import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {FlatList} from 'react-native'
import {ActivityIndicator, Pressable, Row, Text, View} from '@ybase'
import {useLeague} from '~/lib/hooks'

const VenueCard = ({venue, idx}) => {
  const bgColor = idx % 2 ? '#eee' : '#fff'
  const textColor = venue.teams.length > 0 ? '#000' : '#aaa'
  const navigation = useNavigation()

  function HandlePress() {
    navigation.navigate('Venue', {venue: venue})
  }

  return (
    <Pressable onPress={() => HandlePress()}>
      <View style={{backgroundColor: bgColor, padding: 15}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: textColor}}>{venue.name}</Text>
          <Text style={{color: textColor}}>{venue.teams.length} teams</Text>
        </View>
      </View>
    </Pressable>
  )
}

const Venues = props => {
  const league = useLeague()
  const [venues, setVenues] = React.useState([])

  React.useEffect(() => {
    ;(async () => {
      const res = await league.GetVenues()
      setVenues(res)
    })()
  }, [])

  if (venues.length > 0) {
    return (
      <FlatList
        data={venues}
        renderItem={({item, index}) => <VenueCard venue={item} idx={index} />}
      />
    )
  } else {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </View>
    )
  }
}

export default Venues
