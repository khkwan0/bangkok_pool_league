import React from 'react'
import {
  Pressable,
  useColorScheme,
  Linking,
  Image,
  Dimensions,
  View,
} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {useLeagueContext} from '@/context/LeagueContext'
import {useAd} from '@/hooks'
import {absoluteSiteUrl} from '@/lib/aiChatThreads'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'

type AdPayload = {
  title?: string
  message?: string
  id?: string | number
  background?: string | null
  empty?: boolean
}

/** Survive FlatList recycle so remounts don't collapse/expand mid-scroll. */
const adCache = new Map<number, AdPayload>()

const COLLAPSED_MIN_HEIGHT = 56

export default function AdSpot(props: any) {
  const index = Number(props.item?.index ?? 0)
  const cached = adCache.get(index)
  const [title, setTitle] = React.useState(cached?.title ?? '')
  const [message, setMessage] = React.useState(cached?.message ?? '')
  const [showFull, setShowFull] = React.useState(false)
  const [adId, setAdId] = React.useState<string | number | ''>(cached?.id ?? '')
  const [image, setImage] = React.useState<string | null>(
    cached?.background ?? null,
  )
  const [noAd, setNoAd] = React.useState(Boolean(cached?.empty))
  const [loading, setLoading] = React.useState(!cached)
  const colorScheme = useColorScheme()
  const adHook = useAd()
  const {apiUrl} = useLeagueContext() as {apiUrl?: string}
  const width = Dimensions.get('window').width
  const imageWidth = width * 0.9

  React.useEffect(() => {
    if (adCache.has(index)) return

    let cancelled = false
    async function GetAd() {
      try {
        const res = await adHook.GetAdSpot(index)
        if (cancelled) return
        const collapsedTitle =
          typeof res?.title === 'string' ? res.title.trim() : ''
        if (!collapsedTitle) {
          adCache.set(index, {empty: true})
          setNoAd(true)
          setLoading(false)
          return
        }
        const rawBackground =
          typeof res?.background === 'string' ? res.background : null
        const resolvedBackground =
          rawBackground && apiUrl
            ? absoluteSiteUrl(rawBackground, apiUrl)
            : rawBackground
        const payload: AdPayload = {
          title: collapsedTitle,
          message: typeof res?.message === 'string' ? res.message : '',
          id: res?.id,
          background: resolvedBackground,
        }
        adCache.set(index, payload)
        setTitle(payload.title ?? '')
        setMessage(payload.message ?? '')
        if (typeof payload.id !== 'undefined') setAdId(payload.id)
        if (payload.background) setImage(payload.background)
        setLoading(false)
      } catch (e) {
        console.log(e)
        if (!cancelled) {
          adCache.set(index, {empty: true})
          setNoAd(true)
          setLoading(false)
        }
      }
    }
    GetAd()
    return () => {
      cancelled = true
    }
    // adHook is stable enough for this screen; index is the cache key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, apiUrl])

  if (noAd) {
    return <View style={{height: 0}} />
  }

  async function HandleClick() {
    if (typeof adId !== 'undefined' && adId !== '') {
      const res = await adHook.HandleClick(adId)
      if (
        typeof res?.status === 'string' &&
        res.status === 'ok' &&
        typeof res.url === 'string'
      ) {
        Linking.openURL(res.url)
      }
    }
  }

  return (
    <View
      style={{
        margin: 10,
        padding: 16,
        borderRadius: 16,
        minHeight: COLLAPSED_MIN_HEIGHT,
        backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
      {loading ? (
        <View style={{minHeight: 24}} />
      ) : !showFull ? (
        <Pressable onPress={() => setShowFull(true)}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 4, alignItems: 'center'}}>
              <Text>{title}</Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <MCI
                name="plus-circle"
                size={24}
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            </View>
          </View>
        </Pressable>
      ) : (
        <Pressable onPress={() => HandleClick()}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 4, alignItems: 'center'}}>
              <Text>{title}</Text>
            </View>
            <Pressable onPress={() => setShowFull(false)}>
              <MCI
                name="minus-circle"
                size={24}
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            </Pressable>
          </View>
          {message ? (
            <View style={{marginTop: 8}}>
              <Text>{message}</Text>
            </View>
          ) : null}
          {image ? (
            <Image
              resizeMode="contain"
              source={{uri: image}}
              style={{
                width: imageWidth,
                height: imageWidth,
                marginTop: 12,
                alignSelf: 'center',
              }}
            />
          ) : null}
        </Pressable>
      )}
    </View>
  )
}
