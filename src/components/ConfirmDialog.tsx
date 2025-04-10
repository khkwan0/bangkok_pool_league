import React from 'react'
import {Modal, Pressable, Platform} from 'react-native'
import {ThemedView as View} from './ThemedView'
import {ThemedText as Text} from './ThemedText'
import Button from './Button'
import {useTranslation} from 'react-i18next'

interface ConfirmDialogProps {
  isVisible: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const {t} = useTranslation()

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          ...(Platform.OS === 'android' && {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }),
        }}>
        <View className="p-5 rounded-lg bg-white dark:bg-gray-800 w-4/5">
          <Text type="defaultSemiBold" className="text-lg mb-2">
            {title}
          </Text>
          <Text className="mb-4">{message}</Text>
          <View className="flex-row justify-end gap-2">
            <Button onPress={onCancel}>Cancel</Button>
            <Button onPress={onConfirm}>Confirm</Button>
          </View>
        </View>
      </View>
    </Modal>
  )
} 