import React from 'react'
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native'
import {View} from './View'
import {Text} from './Text'
import {useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

export const RadioButton = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const {width} = useWindowDimensions()
  const onChangeOtherAns = text => {
    props.otherAnswer[props.index].otherValue = text
    props.setOtherAnswer(props.otherAnswer)
    props.onPress()
  }
  return (
    <View>
      <View style={styles.radioButtonContainer}>
        <TouchableOpacity onPress={props.onPress} style={styles.radioButton}>
          {props.selected === props.children ? (
            <View
              style={[
                styles.radioButtonIcon,
                {backgroundColor: colors.primary},
              ]}
            />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity onPress={props.onPress}>
          <Text style={styles.radioButtonText} bold>
            {props.children}
          </Text>
        </TouchableOpacity>
      </View>
      {props.selected === 'questionnaire_question_one_answer_seven' &&
        props.selected === props.children && (
          <TextInput
            placeholder={t('questionnaire_question_one_answer_seven')}
            value={props.otherAnswer[props.index]?.otherValue}
            onChangeText={text => onChangeOtherAns(text)}
            borderWidth={0}
            borderRadius={0}
            borderBottomWidth={1}
            placeholderTextColor={colors.onSurface}
            style={{...styles.inputStyle, color: colors.onSurface}}
            maxW={width * 0.7}
          />
        )}
    </View>
  )
}
const styles = StyleSheet.create({
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 45,
    padding: 4,
  },
  radioButton: {
    height: 18,
    width: 18,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bcc0cb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonIcon: {
    height: 14,
    width: 14,
    borderRadius: 7,
  },
  radioButtonText: {
    fontSize: 12,
    marginLeft: 7,
  },
  inputStyle: {
    fontSize: 12,
    padding: 5,
    marginRight: 45,
    marginLeft: 4,
  },
})
