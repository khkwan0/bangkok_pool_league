import React from 'react'
import {Button, Row, Text, TextInput, View} from '@ybase'
import {useTranslation} from 'react-i18next'
import {useLeague, useYBase} from '~/lib/hooks'
import {FlatList} from 'react-native'
import SeasonPicker from '@components/SeasonPicker'
import DivisionPicker from './components/DivisionPicker'
import VenuePicker from './components/VenuePicker'
import AddVenue from '@screens/Settings/Admin/Venues/AddNewVenue'

const AddNewTeam = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const [venues, setVenues] = React.useState([])
  const [newTeamName, setNewTeamName] = React.useState('')
  const [newTeamVenueId, setNewTeamVenueId] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [showAddNewVenue, setShowAddNewVenue] = React.useState(false)
  const [err, setErr] = React.useState('')
  const league = useLeague()

  function HandleCancel() {
    setNewTeamName('')
    setNewTeamVenueId(0)
    props.refresh()
    props.setShowAddNew(false)
  }

  async function HandleSave() {
    if (!newTeamName) {
      setErr('team_name_required')
    } else if (!newTeamVenueId) {
      setErr('venue_required')
    } else {
      try {
        setErr('')
        setLoading(true)
        const res = await league.SaveNewTeam(newTeamName, newTeamVenueId)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          HandleCancel()
        } else {
          setErr(res.error)
        }
      } catch (e) {
        console.log(e)
        setErr(e.message)
      } finally {
        setLoading(false)
      }
    }
  }

  async function GetVenues() {
    try {
      const res = await league.GetAllVenues()
      if (typeof res !== 'undefined' && Array.isArray(res.data)) {
        setVenues(res.data)
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function HandleRefresh() {
    setShowAddNewVenue(false)
    GetVenues()
  }

  React.useEffect(() => {
    GetVenues()
  }, [])

  if (showAddNewVenue) {
    return <AddVenue cancel={setShowAddNewVenue} refresh={HandleRefresh} />
  } else {
    return (
      <View>
        <Text textAlign="center" fontSize="xxl">
          add_new_team
        </Text>
        <View mt={20}>
          <TextInput
            placeholder={t('team_name')}
            value={newTeamName}
            onChangeText={text => setNewTeamName(text)}
          />
        </View>
        <VenuePicker
          setVenue={setNewTeamVenueId}
          venue={newTeamVenueId}
          venues={venues}
        />
        <Text textAlign="center">OR</Text>
        <Button variant="ghost" onPress={() => setShowAddNewVenue(true)}>
          {t('add_new_venue')}
        </Button>
        {err && (
          <View mt={20}>
            <Text textAlign="center" color={colors.error}>
              {err}
            </Text>
          </View>
        )}
        <Row alignItems="center" space={20} mt={20}>
          <View flex={1}>
            <Button variant="outline" onPress={() => HandleCancel()}>
              {t('cancel')}
            </Button>
          </View>
          <View flex={1}>
            <Button onPress={() => HandleSave()}>{t('save')}</Button>
          </View>
        </Row>
      </View>
    )
  }
}

const Team = props => {
  const team = props.item.item
  const [isMounted, setIsMounted] = React.useState(false)
  const [divisionId, setDivisionId] = React.useState(
    team.division_id ? team.division_id : 0,
  )
  const [err, setErr] = React.useState('')
  const {colors} = useYBase()
  const league = useLeague()

  async function SetTeamDivision() {
    try {
      setErr('')
      const res = await league.SetTeamDivision(team.id, divisionId)
      if (typeof res.status !== 'undefined' && res.error) {
        setErr(res.error)
        setDivisionId(0)
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    if (isMounted) {
      if (divisionId > 0) {
        SetTeamDivision()
      }
    }
  }, [divisionId])

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <View py={5}>
      <Row alignItems="center">
        <View flex={1}>
          <Text>
            {team.id} {team.name}
          </Text>
        </View>
        {team.division_short_name && (
          <View flex={1}>
            <Text>{team.division_short_name}</Text>
          </View>
        )}
        <View flex={1}>
          <DivisionPicker
            divisions={props.divisions}
            setDivision={setDivisionId}
            divisionId={divisionId}
          />
          {err && <Text color={colors.error}>{err}</Text>}
        </View>
      </Row>
    </View>
  )
}
const Teams = props => {
  const {colors} = useYBase()
  const league = useLeague()
  const {t} = useTranslation()
  const [season, setSeason] = React.useState(null)
  const [teams, setTeams] = React.useState([])
  const [divisions, setDivisions] = React.useState([])
  const [showAddNew, setShowAddNew] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      try {
        const res2 = await league.GetSeasonV2()
        setSeason(res2[0].id)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      try {
        if (season) {
          const res = await league.GetDivisionsBySeason(season)
          setDivisions(res.data)
        }
      } catch (e) {
        console.log(e)
      }
    })()
  }, [season])

  async function GetTeamsBySeason() {
    try {
      if (season) {
        const res = await league.GetAdminTeamsBySeason(season)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          setTeams(res.data)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    GetTeamsBySeason()
  }, [season])

  if (season) {
    return (
      <View flex={1} px={20} bgColor={colors.background}>
        {!showAddNew && <SeasonPicker setSeason={setSeason} season={season} />}
        <Text textAlign="center" bold fontSize="xxxl" mb={20}>
          {t('season_number', {n: season})}
        </Text>
        {!showAddNew && (
          <View mb={20}>
            <Button onPress={() => setShowAddNew(true)}>
              {t('add_new_team')}
            </Button>
          </View>
        )}
        {showAddNew && (
          <View flex={1}>
            <AddNewTeam
              setShowAddNew={setShowAddNew}
              refresh={GetTeamsBySeason}
            />
          </View>
        )}
        {!showAddNew && (
          <FlatList
            data={teams}
            renderItem={(item, idx) => (
              <Team item={item} idx={idx} divisions={divisions} />
            )}
          />
        )}
      </View>
    )
  } else {
    return null
  }
}

export default Teams
