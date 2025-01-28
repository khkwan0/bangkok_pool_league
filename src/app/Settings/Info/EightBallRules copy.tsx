import React from 'react'
import {FlatList} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLocalSearchParams} from 'expo-router'

interface RuleProps {
  idx: number
  rule: {
    title: string
    rule: string
  }
}

const Rule = (props: RuleProps) => {
  return (
    <View className="my-20 px-20">
      <View>
        <Text>
          {props.idx + 1}. <Text className="font-bold">{props.rule.title}</Text>
        </Text>
      </View>
      <View className="mt-5">
        <Text>{props.rule.rule}</Text>
      </View>
    </View>
  )
}

export default function EightBallRules() {
  const {params} = useLocalSearchParams()
  const allRules = React.useMemo(
    () => JSON.parse(String(params)).rules,
    [params.rules],
  )
  const [rules, setRules] = React.useState([])

  React.useEffect(() => {
    const _rules = allRules.filter(
      (rule: {section: string}) => rule.section === '8 Ball',
    )
    setRules(_rules)
  }, [])

  return (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      data={rules}
      renderItem={({item, index}) => <Rule rule={item} idx={index} />}
    />
  )
}
