import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {FlatList, Pressable, View} from 'react-native'
import {Text} from 'react-native-paper'
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

  return (
    <FlatList
      data={venues}
      renderItem={({item, index}) => <VenueCard venue={item} idx={index} />}
    />
  )
}

export default Venues
