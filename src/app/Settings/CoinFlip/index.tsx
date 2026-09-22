import Button from '@/components/Button'
import {
  CoinFlipScene,
  type CoinFlipOutcome,
  type CoinFlipSceneHandle,
} from '@/components/CoinFlip/CoinFlipScene'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import * as Haptics from 'expo-haptics'
import {Stack} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, View as RNView} from 'react-native'

export default function CoinFlipScreen() {
  const {t} = useTranslation()
  const coinRef = React.useRef<CoinFlipSceneHandle>(null)
  const [flipping, setFlipping] = React.useState(false)
  const [result, setResult] = React.useState<CoinFlipOutcome | null>(null)

  const resultLabel =
    result === 'heads'
      ? t('coin_flip_heads')
      : result === 'tails'
        ? t('coin_flip_tails')
        : null

  const handleFlip = () => {
    if (flipping || Platform.OS === 'web') {
      return
    }
    setResult(null)
    coinRef.current?.flip()
  }

  return (
    <View className="flex-1">
      <Stack.Screen options={{title: t('coin_flip')}} />
      <RNView
        style={{flex: 1, minHeight: 320, marginHorizontal: 16, marginTop: 8}}
        className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        <CoinFlipScene
          ref={coinRef}
          onFlipStart={() => setFlipping(true)}
          onFlipComplete={outcome => {
            setFlipping(false)
            setResult(outcome)
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            )
          }}
        />
      </RNView>
      <View className="px-4 pb-8 pt-4">
        <Text className="text-center text-base opacity-70">
          {t('coin_flip_hint')}
        </Text>
        {resultLabel ? (
          <Text className="mt-3 text-center text-2xl font-bold">
            {resultLabel}
          </Text>
        ) : (
          <Text className="mt-3 text-center text-lg opacity-50">
            {flipping ? t('coin_flip_flipping') : '—'}
          </Text>
        )}
        <RNView className="mt-5">
          <Button
            disabled={flipping || Platform.OS === 'web'}
            onPress={handleFlip}>
            {flipping ? 'coin_flip_flipping' : 'coin_flip_flip'}
          </Button>
        </RNView>
        {Platform.OS === 'web' ? (
          <Text className="mt-3 text-center text-sm opacity-60">
            {t('coin_flip_web_unavailable')}
          </Text>
        ) : null}
      </View>
    </View>
  )
}
