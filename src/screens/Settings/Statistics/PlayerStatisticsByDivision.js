import React from 'react'
import {ActivityIndicator, Row, Text, TextInput, View} from '@ybase'
import {useTranslation} from 'react-i18next'
import {useYBase, useLeague} from '~/lib/hooks'
import RNPickerSelect from 'react-native-picker-select'
import {SectionList} from 'react-native'
import {useSelector} from 'react-redux'

const PlayerListing = ({data, idx}) => {
  const user = useSelector(_state => _state.userData).user
  const {colors} = useYBase()
  let textStyle = {}
  if (typeof user.id !== 'undefined' && user.id === data.playerId) {
    textStyle = {
      fontWeight: 'bold',
      fontSize: 16,
      color: colors.error,
    }
  }
  return (
    <Row alignItems="center" my={5}>
      <View flex={1}>
        <Text style={textStyle}>{idx + 1}</Text>
      </View>
      <View flex={2}>
        <Text style={textStyle}>{data.name}</Text>
      </View>
      <View flex={1}>
        <Text style={textStyle}>{data.played}</Text>
      </View>
      <View flex={1}>
        <Text style={textStyle}>{data.won}</Text>
      </View>
      <View flex={1}>
        <Text style={textStyle}>{data.rawPerfDisp}</Text>
      </View>
      <View flex={1}>
        <Text style={textStyle}>{data.adjPerfDisp}</Text>
      </View>
    </Row>
  )
}

const SectionHeader = ({title}) => {
  return (
    <>
      <Text fontSize="xxl">{title}</Text>
      <Row alignItems="center">
        <View flex={1}>
          <Text bold>rank</Text>
        </View>
        <View flex={2}>
          <Text bold>player</Text>
        </View>
        <View flex={1}>
          <Text bold>played</Text>
        </View>
        <View flex={1}>
          <Text bold>points</Text>
        </View>
        <View flex={1}>
          <Text bold>raw_perf</Text>
        </View>
        <View flex={1}>
          <Text bold>adj_perf</Text>
        </View>
      </Row>
    </>
  )
}

const PlayerStatisticsByDivision = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()
  const league = useLeague()
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedDivision, setSelectedDivision] = React.useState('')
  const [divisions, setDivisions] = React.useState([])
  const [stats, setStats] = React.useState([])
  const [minimumGames, setMinimumGames] = React.useState('20')

  const statsRef = React.useRef([])

  React.useEffect(() => {
    props.navigation.setOptions({
      title: t('player_statistics'),
    })
  }, [])

  React.useEffect(() => {
    GetStats()
  }, [])

  React.useEffect(() => {
    const toSet = Filter()
    setStats(toSet)
  }, [selectedDivision])

  React.useEffect(() => {
    if (statsRef.current.length > 0) {
      const toSet = Filter()
      setStats(toSet)
    }
  }, [minimumGames])

  function Filter() {
    try {
      const minGames = parseInt(minimumGames, 10)
      if (statsRef.current.length > 0) {
        let _stats = []
        if (!selectedDivision) {
          _stats = [...statsRef.current]
        } else {
          _stats = [
            {
              ...statsRef.current.find(
                divStats => divStats.title === selectedDivision,
              ),
            },
          ]
        }
        const toSet = []
        _stats.forEach(_stat => {
          const temp = {
            title: _stat.title,
          }
          const _data = _stat.data
          temp.data = _data.filter(__data => __data.played > minGames)
          toSet.push(temp)
        })
        return toSet
      } else {
        return []
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function GetStats() {
    try {
      setIsLoading(true)
      const res = await league.GetPlayerStatsByDivision()
      if (res.status === 'ok') {
        setDivisions(
          Object.keys(res.data).map(div => {
            return {label: div, value: div}
          }),
        )
        const transformedData = TransformData(res.data)
        statsRef.current = transformedData
        const toSet = Filter()
        setStats(toSet)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  function TransformData(d) {
    try {
      const toReturn = []
      Object.keys(d).forEach(divisionName => {
        toReturn.push({
          title: divisionName,
          data: d[divisionName],
        })
      })
      return toReturn
    } catch (e) {
      console.log(e)
      return []
    }
  }

  if (isLoading) {
    return (
      <View flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator />
      </View>
    )
  } else {
    return (
      <View bgColor={colors.background} flex={1} px={20}>
        <View bgColor={colors.primary}>
          <RNPickerSelect
            style={{
              color: colors.onPrimary,
              inputIOS: {
                padding: 30,
                fontSize: 20,
              },
            }}
            placeholder={{label: t('division'), value: ''}}
            onValueChange={val => setSelectedDivision(val)}
            items={divisions}
          />
        </View>
        <View my={20}>
          <Row alignItems="center" flexWrap="wrap">
            <Text>{t('show_only_players_with_minimum')}&nbsp;</Text>
            <TextInput
              style={{width: 60}}
              value={minimumGames}
              onChangeText={text => setMinimumGames(text)}
              keyboardType="numeric"
            />
            <Text>&nbsp;{t('played').toLowerCase()}.</Text>
          </Row>
        </View>
        {stats.length > 0 && (
          <SectionList
            sections={stats}
            keyExtractor={(item, index) => item.statId}
            renderItem={({item, index}) => (
              <PlayerListing data={item} idx={index} />
            )}
            renderSectionHeader={({section: {title}}) => (
              <SectionHeader title={title} />
            )}
          />
        )}
      </View>
    )
  }
}

export default PlayerStatisticsByDivision
