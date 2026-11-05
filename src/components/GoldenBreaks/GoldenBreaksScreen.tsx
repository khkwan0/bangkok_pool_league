import {GoldenBreakRow} from '@/components/GoldenBreaks/GoldenBreakRow'
import {useGoldenBreaks} from '@/hooks/useGoldenBreaks'
import {useNetwork} from '@/hooks/useNetwork'
import {
  goldenBreakEmphasis,
  type GoldenBreakItem,
} from '@/lib/goldenBreaks'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native'

const PAGE = 20

type SeasonOption = {id: number; name: string}

export default function GoldenBreaksScreen() {
  const {t} = useTranslation()
  const {getGoldenBreaks} = useGoldenBreaks()
  const network = useNetwork()
  const isDark = useColorScheme() === 'dark'
  const [query, setQuery] = React.useState('')
  const [debounced, setDebounced] = React.useState('')
  const [seasonId, setSeasonId] = React.useState<number | null>(null)
  const [seasons, setSeasons] = React.useState<SeasonOption[]>([])
  const [items, setItems] = React.useState<GoldenBreakItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [retry, setRetry] = React.useState(0)
  const requestRef = React.useRef(0)
  const pagingRef = React.useRef(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await network.Get('/seasons')
      if (cancelled || !res || !Array.isArray(res.data)) return
      setSeasons(
        res.data
          .map((row: {id?: number; name?: string; short_name?: string}) => ({
            id: Number(row.id),
            name: String(row.name || row.short_name || row.id),
          }))
          .filter((row: SeasonOption) => row.id > 0),
      )
    })()
    return () => {
      cancelled = true
    }
    // Load the season list once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const requestId = ++requestRef.current
    pagingRef.current = false
    setLoading(true)
    setError(false)
    ;(async () => {
      const res = await getGoldenBreaks({
        q: debounced,
        seasonId,
        limit: PAGE,
        offset: 0,
      })
      if (requestId !== requestRef.current) return
      if (!res) {
        setError(true)
        setItems([])
        setTotal(0)
      } else {
        setItems(res.items)
        setTotal(res.total)
      }
      setLoading(false)
      setRefreshing(false)
    })()
  }, [debounced, seasonId, retry, getGoldenBreaks])

  async function loadMore() {
    if (
      pagingRef.current ||
      loading ||
      items.length === 0 ||
      items.length >= total
    ) {
      return
    }
    pagingRef.current = true
    const requestId = requestRef.current
    const offset = items.length
    setLoadingMore(true)
    const res = await getGoldenBreaks({
      q: debounced,
      seasonId,
      limit: PAGE,
      offset,
    })
    if (requestId !== requestRef.current) {
      pagingRef.current = false
      setLoadingMore(false)
      return
    }
    if (!res) setError(true)
    else {
      setItems(current => [...current, ...res.items])
      setTotal(res.total)
    }
    pagingRef.current = false
    setLoadingMore(false)
  }

  const ink = isDark ? '#F8FAFC' : '#1C1917'
  const muted = isDark ? 'rgba(226,232,240,0.7)' : '#57534E'
  const fieldBg = isDark ? '#1E1E1E' : '#FFFFFF'
  const searching = debounced.length > 0 || seasonId != null

  return (
    <FlatList
      data={items}
      keyExtractor={item => String(item.frameId)}
      contentContainerStyle={{padding: 16, gap: 10, flexGrow: 1}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true)
            setRetry(n => n + 1)
          }}
        />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        <View style={{gap: 12, marginBottom: 6}}>
          <Text style={{fontSize: 14, color: muted, lineHeight: 20}}>
            {t('golden_breaks_page_intro')}
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('golden_breaks_search')}
            placeholderTextColor={muted}
            autoCorrect={false}
            autoCapitalize="none"
            style={{
              backgroundColor: fieldBg,
              color: ink,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? '#333' : '#E7E5E4',
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
            }}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{gap: 8}}>
            <SeasonChip
              label={t('golden_breaks_all_seasons')}
              active={seasonId == null}
              onPress={() => setSeasonId(null)}
              isDark={isDark}
            />
            {seasons.map(season => (
              <SeasonChip
                key={season.id}
                label={season.name}
                active={seasonId === season.id}
                onPress={() => setSeasonId(season.id)}
                isDark={isDark}
              />
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={{marginTop: 24}} />
        ) : error ? (
          <View style={{marginTop: 24, gap: 12}}>
            <Text style={{color: ink}}>{t('golden_breaks_error')}</Text>
            <Pressable onPress={() => setRetry(n => n + 1)}>
              <Text style={{color: '#B45309', fontWeight: '700'}}>
                {t('golden_breaks_retry')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text style={{marginTop: 24, color: muted}}>
            {searching ? t('golden_breaks_no_results') : t('golden_breaks_empty')}
          </Text>
        )
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={{marginVertical: 16}} />
        ) : (
          undefined
        )
      }
      renderItem={({item, index}) => (
        <GoldenBreakRow item={item} emphasis={goldenBreakEmphasis(index)} />
      )}
    />
  )
}

function SeasonChip({
  label,
  active,
  onPress,
  isDark,
}: {
  label: string
  active: boolean
  onPress: () => void
  isDark: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: active ? '#E8A317' : isDark ? '#1E1E1E' : '#FFFFFF',
        borderWidth: 1,
        borderColor: active ? '#E8A317' : isDark ? '#333' : '#E7E5E4',
      }}>
      <Text
        style={{
          fontWeight: '700',
          fontSize: 13,
          color: active ? '#3B2A00' : isDark ? '#F8FAFC' : '#1C1917',
        }}>
        {label}
      </Text>
    </Pressable>
  )
}
