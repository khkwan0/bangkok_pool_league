import React from 'react'
import {Image, Linking, Pressable, ScrollView, View} from 'react-native'
import {Button, Text} from 'react-native-paper'
import TwoColumns from '@components/TwoColumns'
import {showLocation} from 'react-native-map-link'
import config from '~/config'

const Venue = props => {
  const venue = props.route.params.venue

  function HandleTeamPress(team) {
    props.navigation.navigate('Team', {team: team})
  }

  return (
    <ScrollView style={{marginBottom: 10}}>
      <View style={{padding: 20}}>
        <View style={{alignItems: 'center'}}>
          <Image
            source={{uri: config.logoUrl + venue.logo}}
            width={100}
            height={100}
            resizeMode="contain"
          />
        </View>
        <Text variant="titleLarge" style={{textAlign: 'center'}}>
          {venue.name}
        </Text>
      </View>
      <View>
        <TwoColumns label="Location">
          <Text>{venue.location}</Text>
        </TwoColumns>
        <TwoColumns label="Plus Code">
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Text>{venue.plus}</Text>
            {typeof venue.latitude !== 'undefined' &&
              venue.latitude &&
              typeof venue.longitude !== 'undefined' &&
              venue.longitude && (
                <Button
                  mode="outlined"
                  onPress={() =>
                    showLocation({
                      latitude: venue.latitude,
                      longitude: venue.longitude,
                    })
                  }>
                  Map
                </Button>
              )}
          </View>
        </TwoColumns>
        <TwoColumns label="Phone">
          <Text>{venue.phone}</Text>
        </TwoColumns>
        <TwoColumns label="Email">
          <Text>{venue.email}</Text>
        </TwoColumns>
        <Pressable onPress={() => Linking.openURL('https://' + venue.website)}>
          <TwoColumns label="Website" style={{padding: 5}}>
            <Text variant="bodyLarge" style={{fontWeight: 'bold'}}>
              {venue.website}
            </Text>
          </TwoColumns>
        </Pressable>
      </View>

      <View>
        {venue.teams.map((team, idx) => (
          <Pressable
            key={team.name + idx}
            onPress={() => HandleTeamPress(team)}>
            <TwoColumns label={idx === 0 ? 'Teams' : ''} style={{padding: 10}}>
              <Text variant="bodyLarge" style={{fontWeight: 'bold'}}>
                {team.name}
              </Text>
            </TwoColumns>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

export default Venue
