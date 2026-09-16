import {ThemedText as Text} from '@/components/ThemedText'
import React from 'react'
import {
  LayoutChangeEvent,
  Pressable,
  useColorScheme,
  View,
} from 'react-native'
import {Gesture, GestureDetector} from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

export type SeedListEntry = {
  id: number
  seed: number
  participant_type: string
  team_id?: number | null
  player_id?: number | null
  label?: string | null
  display_name?: string | null
}

type Props = {
  entries: SeedListEntry[]
  editable: boolean
  busy?: boolean
  onReorder: (orderedIds: number[]) => void | Promise<void>
  onRemove?: (entryId: number) => void
  /** Disable parent ScrollView while a row is dragging. */
  onDraggingChange?: (dragging: boolean) => void
}

const ROW_GAP = 10

function rowLabel(e: SeedListEntry) {
  return e.display_name || e.label || e.participant_type
}

export default function SeedReorderList({
  entries,
  editable,
  busy,
  onReorder,
  onRemove,
  onDraggingChange,
}: Props) {
  const isDark = useColorScheme() === 'dark'
  const sorted = React.useMemo(
    () => [...entries].sort((a, b) => a.seed - b.seed || a.id - b.id),
    [entries],
  )
  const [heights, setHeights] = React.useState<Record<number, number>>({})
  const [draggingId, setDraggingId] = React.useState<number | null>(null)
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null)
  const orderRef = React.useRef(sorted.map(e => e.id))
  orderRef.current = sorted.map(e => e.id)

  const defaultH = 72
  const rowHeight = (id: number) => heights[id] ?? defaultH

  const onRowLayout = (id: number, e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height
    setHeights(prev => (prev[id] === h ? prev : {...prev, [id]: h}))
  }

  const startDrag = (id: number) => {
    setDraggingId(id)
    setHoverIndex(orderRef.current.indexOf(id))
    onDraggingChange?.(true)
  }

  const moveDrag = (id: number, translationY: number) => {
    const from = orderRef.current.indexOf(id)
    if (from < 0) return
    let y = translationY
    let target = from
    if (y > 0) {
      while (
        target < orderRef.current.length - 1 &&
        y >
          (rowHeight(orderRef.current[target]) +
            rowHeight(orderRef.current[target + 1])) /
            2 +
            ROW_GAP / 2
      ) {
        y -= rowHeight(orderRef.current[target + 1]) + ROW_GAP
        target++
      }
    } else if (y < 0) {
      while (
        target > 0 &&
        y <
          -(
            (rowHeight(orderRef.current[target]) +
              rowHeight(orderRef.current[target - 1])) /
              2 +
            ROW_GAP / 2
          )
      ) {
        y += rowHeight(orderRef.current[target - 1]) + ROW_GAP
        target--
      }
    }
    setHoverIndex(target)
  }

  const endDrag = async (id: number) => {
    const from = orderRef.current.indexOf(id)
    const to = hoverIndex ?? from
    setDraggingId(null)
    setHoverIndex(null)
    onDraggingChange?.(false)
    if (from < 0 || to < 0 || from === to) return
    const next = [...orderRef.current]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    await onReorder(next)
  }

  if (sorted.length === 0) return null

  return (
    <View style={{marginTop: 8}}>
      {editable ? (
        <Text style={{fontSize: 12, opacity: 0.55, marginBottom: 8}}>
          Drag the handle to set seed order (1 at the top).
        </Text>
      ) : null}
      {sorted.map((e, index) => {
        const displaySeed =
          draggingId != null && hoverIndex != null
            ? (() => {
                const ids = [...orderRef.current]
                const from = ids.indexOf(draggingId)
                if (from < 0) return index + 1
                const [item] = ids.splice(from, 1)
                ids.splice(hoverIndex, 0, item)
                return ids.indexOf(e.id) + 1
              })()
            : e.seed

        return (
          <SeedRow
            key={e.id}
            entry={e}
            seed={displaySeed}
            editable={editable}
            busy={busy}
            isDark={isDark}
            isDragging={draggingId === e.id}
            onLayout={ev => onRowLayout(e.id, ev)}
            onRemove={onRemove}
            onDragStart={() => startDrag(e.id)}
            onDragMove={ty => moveDrag(e.id, ty)}
            onDragEnd={() => endDrag(e.id)}
          />
        )
      })}
    </View>
  )
}

function SeedRow({
  entry,
  seed,
  editable,
  busy,
  isDark,
  isDragging,
  onLayout,
  onRemove,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  entry: SeedListEntry
  seed: number
  editable: boolean
  busy?: boolean
  isDark: boolean
  isDragging: boolean
  onLayout: (e: LayoutChangeEvent) => void
  onRemove?: (entryId: number) => void
  onDragStart: () => void
  onDragMove: (ty: number) => void
  onDragEnd: () => void
}) {
  const ty = useSharedValue(0)
  const dragging = useSharedValue(0)

  const pan = Gesture.Pan()
    .enabled(editable && !busy)
    .activateAfterLongPress(120)
    .onStart(() => {
      dragging.value = 1
      runOnJS(onDragStart)()
    })
    .onUpdate(e => {
      ty.value = e.translationY
      runOnJS(onDragMove)(e.translationY)
    })
    .onEnd(() => {
      ty.value = withSpring(0)
      dragging.value = 0
      runOnJS(onDragEnd)()
    })
    .onFinalize(() => {
      ty.value = withSpring(0)
      dragging.value = 0
    })

  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateY: ty.value}],
    zIndex: dragging.value ? 20 : 1,
    opacity: dragging.value ? 0.95 : 1,
    shadowOpacity: dragging.value ? 0.25 : 0,
    elevation: dragging.value ? 6 : 0,
  }))

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        {
          marginBottom: ROW_GAP,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isDark ? '#333' : '#e2e8f0',
          backgroundColor: isDark
            ? isDragging
              ? '#1e293b'
              : '#1f1f1f'
            : isDragging
              ? '#eff6ff'
              : '#fff',
          padding: 12,
        },
        animStyle,
      ]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        {editable ? (
          <GestureDetector gesture={pan}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 10,
                borderRadius: 6,
                backgroundColor: isDark ? '#334155' : '#e2e8f0',
              }}
              accessibilityLabel="Drag to reorder seed">
              <Text style={{fontSize: 14, opacity: 0.7, letterSpacing: 1}}>
                ⠿
              </Text>
            </View>
          </GestureDetector>
        ) : null}
        <View style={{flex: 1, paddingRight: 8}}>
          <Text style={{fontWeight: '700'}}>
            #{seed} {rowLabel(entry)}
          </Text>
          <Text style={{marginTop: 2, fontSize: 12, opacity: 0.55}}>
            {entry.participant_type}
            {entry.team_id ? ` · team ${entry.team_id}` : ''}
            {entry.player_id ? ` · player ${entry.player_id}` : ''}
          </Text>
        </View>
        {editable && onRemove ? (
          <Pressable onPress={() => onRemove(entry.id)} disabled={busy}>
            <Text style={{color: '#dc2626', fontWeight: '600'}}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  )
}
