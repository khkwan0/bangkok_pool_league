import {ThemedText as Text} from '@/components/ThemedText'
import {resolveForumImageUrl} from '@/lib/forumImage'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {Image} from 'expo-image'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

type ForumImageViewerProps = {
  uri: string | null
  onClose: () => void
}

export function ForumImageViewer({uri, onClose}: ForumImageViewerProps) {
  const {t} = useTranslation()
  const insets = useSafeAreaInsets()
  const {width, height} = useWindowDimensions()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (uri) setLoading(true)
  }, [uri])

  if (!uri) return null

  const resolvedUri = resolveForumImageUrl(uri)

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/90">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-4"
          style={{top: insets.top + 8}}>
          <Text className="text-sm font-medium text-white/80">
            {t('forums_image_viewer_hint')}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{backgroundColor: 'rgba(255,255,255,0.15)'}}>
            <MCI name="close" size={22} color="#fff" />
          </Pressable>
        </View>
        <View
          className="flex-1 items-center justify-center px-3"
          style={{paddingTop: insets.top + 48, paddingBottom: insets.bottom + 16}}>
          {loading ? (
            <ActivityIndicator color={isDark ? '#93c5fd' : '#fff'} size="large" />
          ) : null}
          <Image
            source={{uri: resolvedUri}}
            contentFit="contain"
            style={{width: width - 24, height: height - insets.top - insets.bottom - 72}}
            onLoadEnd={() => setLoading(false)}
            onError={() => setLoading(false)}
            accessibilityLabel={t('forums_image_viewer_label')}
          />
        </View>
      </View>
    </Modal>
  )
}

type ForumPostImageProps = {
  displayUri: string
  fullUri: string
  onPress: (fullUri: string) => void
}

export function ForumPostImage({displayUri, fullUri, onPress}: ForumPostImageProps) {
  const {t} = useTranslation()
  const {width: windowWidth} = useWindowDimensions()
  const resolvedDisplay = resolveForumImageUrl(displayUri)
  const imageWidth = Math.min(windowWidth - 48, 560)

  return (
    <Pressable
      onPress={() => onPress(fullUri)}
      accessibilityRole="imagebutton"
      accessibilityLabel={t('forums_image_viewer_label')}
      className="my-2 overflow-hidden rounded-lg"
      style={{alignSelf: 'flex-start', maxWidth: '100%'}}>
      <Image
        source={{uri: resolvedDisplay}}
        contentFit="contain"
        style={{
          width: imageWidth,
          maxHeight: 480,
          minHeight: 80,
        }}
      />
    </Pressable>
  )
}
