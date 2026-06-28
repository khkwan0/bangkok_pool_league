import {ZoomableView} from '@/components/Forums/ZoomableView'
import {Image} from 'expo-image'
import React from 'react'

export type ZoomableForumImageProps = {
  uri: string
  width: number
  height: number
  accessibilityLabel: string
  maxScale?: number
  doubleTapScale?: number
  scrollAware?: boolean
  onLoad?: (event: {source: {width: number; height: number}}) => void
  onLoadEnd?: () => void
  onError?: () => void
  onPress?: () => void
  onZoomChange?: (zoomed: boolean) => void
}

export function ZoomableForumImage({
  uri,
  width,
  height,
  accessibilityLabel,
  maxScale,
  doubleTapScale,
  scrollAware,
  onLoad,
  onLoadEnd,
  onError,
  onPress,
  onZoomChange,
}: ZoomableForumImageProps) {
  return (
    <ZoomableView
      width={width}
      height={height}
      maxScale={maxScale}
      doubleTapScale={doubleTapScale}
      scrollAware={scrollAware}
      onPress={onPress}
      onZoomChange={onZoomChange}
      style={{width, height}}>
      <Image
        source={{uri}}
        contentFit="contain"
        style={{width, height}}
        onLoad={onLoad}
        onLoadEnd={onLoadEnd}
        onError={onError}
        accessibilityLabel={accessibilityLabel}
      />
    </ZoomableView>
  )
}
