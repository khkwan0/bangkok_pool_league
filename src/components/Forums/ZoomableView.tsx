import React from 'react'
import {type LayoutChangeEvent, type StyleProp, type ViewStyle} from 'react-native'
import {Gesture, GestureDetector} from 'react-native-gesture-handler'
import Animated, {
  cancelAnimation,
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

const MIN_SCALE = 1
const DEFAULT_MAX_SCALE = 4
const DEFAULT_DOUBLE_TAP_SCALE = 2.5
const PAN_SPRING = {damping: 22, stiffness: 240, mass: 0.35}
const PAN_DECAY_DECELERATION = 0.997

export type ZoomableViewProps = {
  children: React.ReactNode
  /** Fallback size before layout; also used for fixed-size views like images. */
  width?: number
  height?: number
  maxScale?: number
  doubleTapScale?: number
  /** When true, single-finger pan only activates while zoomed so a parent list can scroll. */
  scrollAware?: boolean
  onPress?: () => void
  onZoomChange?: (zoomed: boolean) => void
  style?: StyleProp<ViewStyle>
}

export function ZoomableView({
  children,
  width,
  height,
  maxScale = DEFAULT_MAX_SCALE,
  doubleTapScale = DEFAULT_DOUBLE_TAP_SCALE,
  scrollAware = false,
  onPress,
  onZoomChange,
  style,
}: ZoomableViewProps) {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)
  const layoutWidth = useSharedValue(width ?? 0)
  const layoutHeight = useSharedValue(height ?? 0)

  const notifyZoomChange = React.useCallback(
    (zoomed: boolean) => {
      onZoomChange?.(zoomed)
    },
    [onZoomChange],
  )
  const shouldNotifyZoom = Boolean(onZoomChange)

  React.useEffect(() => {
    if (width != null && width > 0) {
      layoutWidth.value = width
    }
    if (height != null && height > 0) {
      layoutHeight.value = height
    }
  }, [width, height, layoutWidth, layoutHeight])

  const handleLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const {width: measuredWidth, height: measuredHeight} =
        event.nativeEvent.layout
      if (measuredWidth > 0) {
        layoutWidth.value = measuredWidth
      }
      if (measuredHeight > 0) {
        layoutHeight.value = measuredHeight
      }
    },
    [layoutWidth, layoutHeight],
  )

  const panBounds = (currentScale: number) => {
    'worklet'
    return {
      maxX: (layoutWidth.value * (currentScale - 1)) / 2,
      maxY: (layoutHeight.value * (currentScale - 1)) / 2,
    }
  }

  const clampTranslation = (x: number, y: number, currentScale: number) => {
    'worklet'
    const {maxX, maxY} = panBounds(currentScale)
    return {
      x: clamp(x, -maxX, maxX),
      y: clamp(y, -maxY, maxY),
    }
  }

  const syncSavedTranslation = () => {
    'worklet'
    savedTranslateX.value = translateX.value
    savedTranslateY.value = translateY.value
  }

  const applyFocalPinch = (
    focalX: number,
    focalY: number,
    nextScale: number,
    baseScale: number,
    baseTranslateX: number,
    baseTranslateY: number,
  ) => {
    'worklet'
    if (layoutWidth.value <= 0 || layoutHeight.value <= 0) {
      scale.value = nextScale
      return
    }

    const originX = focalX - layoutWidth.value / 2
    const originY = focalY - layoutHeight.value / 2
    const scaleRatio = nextScale / baseScale

    scale.value = nextScale
    translateX.value = originX - (originX - baseTranslateX) * scaleRatio
    translateY.value = originY - (originY - baseTranslateY) * scaleRatio
  }

  const springToBounds = (currentScale: number) => {
    'worklet'
    const clamped = clampTranslation(
      translateX.value,
      translateY.value,
      currentScale,
    )
    translateX.value = withSpring(clamped.x, PAN_SPRING, finished => {
      if (finished) {
        syncSavedTranslation()
      }
    })
    translateY.value = withSpring(clamped.y, PAN_SPRING, finished => {
      if (finished) {
        syncSavedTranslation()
      }
    })
    savedTranslateX.value = clamped.x
    savedTranslateY.value = clamped.y
  }

  const clampToBoundsIfNeeded = (currentScale: number) => {
    'worklet'
    const clamped = clampTranslation(
      translateX.value,
      translateY.value,
      currentScale,
    )
    const dx = Math.abs(clamped.x - translateX.value)
    const dy = Math.abs(clamped.y - translateY.value)

    if (dx < 1 && dy < 1) {
      syncSavedTranslation()
      return
    }

    if (dx < 6 && dy < 6) {
      translateX.value = clamped.x
      translateY.value = clamped.y
      syncSavedTranslation()
      return
    }

    springToBounds(currentScale)
  }

  const syncZoomState = (currentScale: number) => {
    'worklet'
    if (shouldNotifyZoom) {
      runOnJS(notifyZoomChange)(currentScale > MIN_SCALE)
    }
  }

  const resetTransform = () => {
    'worklet'
    cancelAnimation(translateX)
    cancelAnimation(translateY)
    cancelAnimation(scale)
    scale.value = withTiming(1)
    savedScale.value = 1
    translateX.value = withTiming(0)
    translateY.value = withTiming(0)
    savedTranslateX.value = 0
    savedTranslateY.value = 0
    syncZoomState(MIN_SCALE)
  }

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      cancelAnimation(translateX)
      cancelAnimation(translateY)
      savedScale.value = scale.value
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate(event => {
      const nextScale = clamp(savedScale.value * event.scale, MIN_SCALE, maxScale)
      applyFocalPinch(
        event.focalX,
        event.focalY,
        nextScale,
        savedScale.value,
        savedTranslateX.value,
        savedTranslateY.value,
      )
    })
    .onEnd(() => {
      if (scale.value <= MIN_SCALE) {
        resetTransform()
        return
      }
      savedScale.value = scale.value
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
      clampToBoundsIfNeeded(scale.value)
      syncZoomState(scale.value)
    })

  const pan = Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .manualActivation(scrollAware)
    .onTouchesDown((_event, state) => {
      if (scrollAware && scale.value > MIN_SCALE) {
        state.activate()
      }
    })
    .onTouchesMove((_event, state) => {
      if (!scrollAware) {
        state.activate()
        return
      }
      if (scale.value > MIN_SCALE) {
        state.activate()
      } else {
        state.fail()
      }
    })
    .onBegin(() => {
      cancelAnimation(translateX)
      cancelAnimation(translateY)
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate(event => {
      if (scale.value <= MIN_SCALE) {
        return
      }
      translateX.value = savedTranslateX.value + event.translationX
      translateY.value = savedTranslateY.value + event.translationY
    })
    .onEnd(event => {
      if (scale.value <= MIN_SCALE) {
        return
      }

      const {maxX, maxY} = panBounds(scale.value)
      const speed = Math.hypot(event.velocityX, event.velocityY)

      if (speed < 80) {
        clampToBoundsIfNeeded(scale.value)
        syncZoomState(scale.value)
        return
      }

      translateX.value = withDecay(
        {
          velocity: event.velocityX,
          deceleration: PAN_DECAY_DECELERATION,
          clamp: [-maxX, maxX],
          rubberBandEffect: true,
          rubberBandFactor: 0.55,
        },
        finished => {
          if (finished) {
            clampToBoundsIfNeeded(scale.value)
          }
        },
      )
      translateY.value = withDecay({
        velocity: event.velocityY,
        deceleration: PAN_DECAY_DECELERATION,
        clamp: [-maxY, maxY],
        rubberBandEffect: true,
        rubberBandFactor: 0.55,
      })
      syncZoomState(scale.value)
    })

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(event => {
      if (scale.value > MIN_SCALE) {
        resetTransform()
        return
      }

      cancelAnimation(scale)
      cancelAnimation(translateX)
      cancelAnimation(translateY)

      const nextScale = doubleTapScale
      if (layoutWidth.value > 0 && layoutHeight.value > 0) {
        applyFocalPinch(
          event.x,
          event.y,
          nextScale,
          MIN_SCALE,
          translateX.value,
          translateY.value,
        )
      } else {
        scale.value = withTiming(nextScale)
      }
      savedScale.value = nextScale
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
      syncZoomState(nextScale)
    })

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd(() => {
      if (scale.value <= MIN_SCALE && onPress) {
        runOnJS(onPress)()
      }
    })

  const taps = onPress ? Gesture.Exclusive(doubleTap, singleTap) : doubleTap
  const gesture = Gesture.Simultaneous(pinch, pan, taps)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }))

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View onLayout={handleLayout} style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  )
}
