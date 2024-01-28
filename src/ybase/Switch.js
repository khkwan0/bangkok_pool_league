import {Switch as RNSwitch, Platform} from 'react-native'
import {useYBase} from '~/lib/hooks'

export const Switch = props => {
  const {colors} = useYBase()

  return (
    // eslint-disable-next-line react/react-in-jsx-scope
    <RNSwitch
      ios_backgroundColor={colors.thumbTrack}
      thumbColor={colors.switchThumb}
      trackColor={{
        false: colors.thumbTrack,
        true: colors.green['300'],
      }}
      style={
        Platform.OS === 'ios' ? {transform: [{scaleX: 0.7}, {scaleY: 0.7}]} : {}
      }
      {...props}
    />
  )
}
