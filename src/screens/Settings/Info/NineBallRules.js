import React from 'react'
import {useYBase} from '~/lib/hooks'
import {Row, Text, View} from '@ybase'
import {FlatList} from 'react-native'

const Rule = props => {
  return (
    <View my={20} px={20}>
      <View>
        <Text>
          {props.idx + 1}. <Text bold>{props.rule.title}</Text>
        </Text>
      </View>
      <View mt={5}>
        <Text>{props.rule.rule}</Text>
      </View>
    </View>
  )
}

const NineBallRules = props => {
  const {colors} = useYBase()
  const [rules, setRules] = React.useState([])

  React.useEffect(() => {
    const _rules = props.route.params.rules.filter(
      rule => rule.section === '9 Ball',
    )
    setRules(_rules)
  }, [])

  return (
    <FlatList
      contentContainerStyle={{flexGrow: 1, backgroundColor: colors.background}}
      renderItem={({item, index}) => <Rule rule={item} idx={index} />}
      data={rules}
    />
  )
}

export default NineBallRules
