import {
  ActivityIndicator,
  Image,
  Pressable,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView} from '@/components/ThemedView'
import CustomTextInput from '@/components/TextInput'
import {useLeagueContext} from '@/context/LeagueContext'
import flags from '@/countries.emoji.json'
import config from '@/config'
import {useTranslation} from 'react-i18next'
import {Ionicons} from '@expo/vector-icons'
import {useState, useRef, useEffect, useMemo} from 'react'
import {Picker} from '@react-native-picker/picker'
import Animated, {FadeIn, FadeOut, SlideInDown, SlideOutDown} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useLeague, useAccount} from '@/hooks'
import ImagePicker from 'react-native-image-crop-picker'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
interface CountryData {
  name: string
  emoji: string
  [key: string]: any
}

interface Country {
  id: number
  name_en: string
  name_th: string
  iso_3166_1_alpha_2_code: string
}

export default function ProfileOptions() {
  const {state, dispatch} = useLeagueContext()
  const {user} = state
  const {t} = useTranslation()
  const scrollViewRef = useRef<ScrollView>(null)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isEditingFirstName, setIsEditingFirstName] = useState(false)
  const [isEditingLastName, setIsEditingLastName] = useState(false)
  const [isEditingNationality, setIsEditingNationality] = useState(false)
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [firstName, setFirstName] = useState(user?.firstname ?? '')
  const [lastName, setLastName] = useState(user?.lastname ?? '')
  const [scrollOffset, setScrollOffset] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState(
    user?.nationality?.id ?? 0,
  )
  const [newAvatar, setNewAvatar] = useState<ImagePicker.Image | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEditingProfilePicture, setIsEditingProfilePicture] = useState(false)
  const league = useLeague()
  const account = useAccount()
  const [imageError, setImageError] = useState<Error | null>(null)

  useMemo(() => {
    if (searchQuery.length > 0) {
      setCountries(countries.filter(country => country.name_en.toLowerCase().includes(searchQuery.toLowerCase())))
    } else {
      setCountries(countries)
    }
  }, [searchQuery])

  async function getCountries() {
    try {
      const res = await league.GetCountries()
      if (typeof res.status !== 'undefined' &&res.status === 'ok' && typeof res.data !== 'undefined') {
        setCountries(res.data.sort((a, b) => a.name_en.localeCompare(b.name_en)).map(country => ({
          ...country,
          emoji: getCountryFlag(country.iso_3166_1_alpha_2_code),
        })))
      }
    } catch(e) {
      console.error(e)
      throw new Error(e)
    }
  }

  useEffect(() => {
    try {
      setIsLoading(true)
      getCountries()
    } catch(e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
    return () => {
      ImagePicker.clean().catch(console.error)
    }
  }, [])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      event => {
        const keyboardHeight = event.endCoordinates.height
        const screenHeight = Dimensions.get('window').height
        const visibleHeight = screenHeight - keyboardHeight

        // Calculate scroll offset based on which field is being edited
        let offset = 0
        if (isEditingNickname) {
          offset = 200 // Adjust these values based on your layout
        } else if (isEditingFirstName) {
          offset = 300
        } else if (isEditingLastName) {
          offset = 400
        }

        setScrollOffset(offset)
        scrollViewRef.current?.scrollTo({
          y: offset,
          animated: true,
        })
      },
    )

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setScrollOffset(0)
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        })
      },
    )

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [isEditingNickname, isEditingFirstName, isEditingLastName])

  function getCountryFlag(country: string) {
    const flag = (flags as {[key: string]: {emoji: string}})[country]
    return flag?.emoji || ''
  }

  async function handleSaveNickname() {
    try { 
      const res = await account.SetNickName(nickname)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        dispatch({type: 'SET_NICKNAME', payload: nickname}) 
      }
    } catch(e) {
      console.error(e)
    } finally {
      setIsEditingNickname(false)
    }
  }

  async function handleSaveFirstName() {
    try { 
      const res = await account.SetFirstName(firstName)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        dispatch({type: 'SET_FIRST_NAME', payload: firstName}) 
      }
    } catch(e) {
      console.error(e)
    } finally {
      setIsEditingFirstName(false)
    }
  }

  async function handleSaveLastName() {
    try { 
      const res = await account.SetLastName(lastName)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        dispatch({type: 'SET_LAST_NAME', payload: lastName}) 
      }
    } catch(e) {
      console.error(e)
    } finally {
      setIsEditingLastName(false)
    }
  }

  async function handleSaveNationality() {
    try {
      const res = await account.SetNationality(selectedCountry)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        dispatch({type: 'SET_NATIONALITY', payload: res.data}) 
      }
    } catch(e) {
      console.error(e)
    } finally {
      setIsEditingNationality(false)
    }
  }

  function handleCancelEdit(
    setIsEditing: (value: boolean) => void,
    setValue: (value: string) => void,
    originalValue: string,
  ) {
    setValue(originalValue ?? '')
    setIsEditing(false)
    Keyboard.dismiss()
  }

  async function HandleSaveNewAvatar() {
    try {
      const res = await account.SaveAvatar(newAvatar?.path)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        dispatch({type: 'SET_PROFILE_PICTURE', payload: res.data})
      }
    } catch(e) {
      console.error(e)
    }
  }

  function HandleShowPicker(type: 'gallery' | 'camera') {
    try {
      let image = null
      if (type === 'gallery') {
        const params = {
          width: 300,
          height: 300,
          cropping: true,
          mediaType: 'photo',
        }
        ImagePicker.openPicker(params).then(image => {
          setNewAvatar(image)
        })
      } else {
        ImagePicker.openCamera({
          width: 300,
          height: 300,
          cropping: true,
        }).then(image => {
          setNewAvatar(image)
        })
      }
    } catch(e) {
      console.error(e)
      setImageError(e)
    }
  }

  if (isEditingProfilePicture) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <Animated.View 
          entering={SlideInDown}
          exiting={SlideOutDown}
          className="flex-1">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <Pressable
              onPress={() => setIsEditingProfilePicture(false)}
              className="p-2">
              <Ionicons
                name="close"
                size={24}
                color="#4B5563"
                className="dark:text-gray-300"
              />
            </Pressable>
          </View>
          <View className="flex-1 items-center justify-center">
            {newAvatar && (
              <Image
                source={{uri: newAvatar.path}}
                width={200}
                height={200}
                resizeMode="contain"
                style={{borderRadius: 100}}
              />
            )}
            {!newAvatar && user.profile_picture && (
              <>
                <Image
                  source={{uri: config.profileUrl + user.profile_picture}}
                  width={200}
                  height={200}
                  resizeMode="contain"
                  style={{borderRadius: 100}}
                />
              </>
            )}
            {!newAvatar && !user.profile_picture && (
              <View
                bgColor={colors.profilePicBackground}
                width={200}
                height={200}
                borderRadius={100}
                alignItems="center"
                justifyContent="center">
                <MCI
                  name="plus-circle-outline"
                  color={colors.primary}
                  size={40}
                />
                <Text>upload</Text>
              </View>
            )}
            {imageError && (
              <Text className="text-red-500">{imageError.message}</Text>
            )}
            {newAvatar && (
              <View>
                <Pressable className="mt-10 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-full" onPress={() => setNewAvatar(null)}>
                  <Text>reset</Text>
                </Pressable>
                <Pressable className="mt-10 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-full" onPress={() => HandleSaveNewAvatar()}>
                  <Text>save</Text>
                </Pressable>
              </View>
            )}
            {!newAvatar && (
              <View className="mt-10">
                <Pressable className="my-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-full" onPress={() => HandleShowPicker('gallery')}>
                  <Text>
                    {t('gallery')}
                  </Text>
                </Pressable>
                <Pressable className=" my-2 bg-primary border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-full" onPress={() => HandleShowPicker('camera')}>
                <Text>
                  {t('camera')}
                </Text>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>
      </SafeAreaView> 
    )
  } else if (isEditingNationality) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <Animated.View 
          entering={SlideInDown}
          exiting={SlideOutDown}
          className="flex-1">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <Pressable
              onPress={() => setIsEditingNationality(false)}
              className="p-2">
              <Ionicons
                name="close"
                size={24}
                color="#4B5563"
                className="dark:text-gray-300"
              />
            </Pressable>
            <Text className="text-lg font-semibold">
              {t('select_country')}
            </Text>
            <View className="w-10" />
          </View>
          <View className="p-4 border-b border-gray-200 dark:border-gray-800">
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <Ionicons
                name="search"
                size={20}
                color="#4B5563"
                className="dark:text-gray-400 mr-2"
              />
              <CustomTextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('search_countries')}
                className="flex-1"
              />
            </View>
          </View>
          <ScrollView className="flex-1">
            {countries.map(country => (
              <Pressable
                key={country.id}
                className={`flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800 ${
                  selectedCountry === country.id
                    ? 'bg-gray-50 dark:bg-gray-800'
                    : ''
                }`}
                onPress={() => setSelectedCountry(country.id)}>
                <Text className="text-2xl mr-3">{country.emoji}</Text>
                <Text className="text-base">{country.name_en}</Text>
                <Text className="text-base">/{country.name_th}</Text>
                {selectedCountry === country.id && (
                  <Ionicons
                    name="checkmark"
                    size={24}
                    color="#4B5563"
                    className="ml-auto"
                  />
                )}
              </Pressable>
            ))}
          </ScrollView>
          <View className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Pressable
              className="bg-primary py-3 rounded-lg items-center"
              onPress={handleSaveNationality}>
              <Text className="text-white font-medium">{t('save')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    )
  } else {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{paddingBottom: 100}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="p-4">
            <View className="items-center justify-center mb-8">
              <Image
                source={{uri: config.profileUrl + user?.profile_picture}}
                className="h-32 w-32 rounded-full mb-4"
              />
              <Pressable className="bg-primary px-6 py-3 rounded-full" onPress={() => setIsEditingProfilePicture(true)}>
                <Text className="text-white font-medium">
                  {t('change_profile_picture')}
                </Text>
              </Pressable>
            </View>
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
                <ThemedView className="rounded-lg p-4 mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-semibold">{t('nationality')}</Text>
                    <Pressable
                      className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
                      onPress={() => setIsEditingNationality(true)}>
                      <Ionicons
                        name="pencil"
                        size={16}
                        color="#4B5563"
                        className="mr-1"
                      />
                      <Text className="text-gray-600 dark:text-gray-300 text-sm">
                        {t('edit')}
                      </Text>
                    </Pressable>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text>{user?.nationality?.name_en ?? t('not_provided')}</Text>
                    <Text className="text-gray-500">
                      {user?.nationality?.name_th ?? ''}
                    </Text>
                    <Text className="text-2xl">
                      {getCountryFlag(
                        user?.nationality?.iso_3166_1_alpha_2_code ?? '',
                      )}
                    </Text>
                  </View>
                </ThemedView>


                <ThemedView className="rounded-lg p-4 mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-semibold">{t('nickname')}</Text>
                    {isEditingNickname ? (
                      <View className="flex-row gap-2">
                        <Pressable
                          className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
                          onPress={() =>
                            handleCancelEdit(
                              setIsEditingNickname,
                              setNickname,
                              user?.nickname ?? '',
                            )
                          }>
                          <Ionicons
                            name="close"
                            size={16}
                            color="#4B5563"
                            className="mr-1"
                          />
                          <Text className="text-gray-600 dark:text-gray-300 text-sm">
                            {t('cancel')}
                          </Text>
                        </Pressable>
                        <Pressable
                          className="flex-row items-center bg-primary px-3 py-1.5 rounded-full"
                          onPress={handleSaveNickname}>
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#fff"
                            className="mr-1"
                          />
                          <Text className="text-white text-sm">{t('save')}</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
                        onPress={() => setIsEditingNickname(true)}>
                        <Ionicons
                          name="pencil"
                          size={16}
                          color="#4B5563"
                          className="mr-1"
                        />
                        <Text className="text-gray-600 dark:text-gray-300 text-sm">
                          {t('edit')}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  {isEditingNickname ? (
                    <View className="flex-row items-center gap-2">
                      <CustomTextInput
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder={t('nickname_placeholder')}
                        autoFocus
                      />
                    </View>
                  ) : (
                    <Text>{nickname || t('not_provided')}</Text>
                  )}
                </ThemedView>

                <ThemedView className="rounded-lg p-4 mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-semibold">{t('first_name')}</Text>
                    {isEditingFirstName ? (
                      <View className="flex-row gap-2">
                        <Pressable
                          className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
                          onPress={() =>
                            handleCancelEdit(
                              setIsEditingFirstName,
                              setFirstName,
                              user?.firstname ?? '',
                            )
                          }>
                          <Ionicons
                            name="close"
                            size={16}
                            color="#4B5563"
                            className="mr-1"
                          />
                          <Text className="text-gray-600 dark:text-gray-300 text-sm">
                            {t('cancel')}
                          </Text>
                        </Pressable>
                        <Pressable
                          className="flex-row items-center bg-primary px-3 py-1.5 rounded-full"
                          onPress={handleSaveFirstName}>
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#fff"
                          className="mr-1"
                        />
                        <Text className="text-white text-sm">{t('save')}</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
                      onPress={() => setIsEditingFirstName(true)}>
                      <Ionicons
                        name="pencil"
                        size={16}
                        color="#4B5563"
                        className="mr-1"
                      />
                      <Text className="text-gray-600 dark:text-gray-300 text-sm">
                        {t('edit')}
                      </Text>
                    </Pressable>
                  )}
                </View>
                {isEditingFirstName ? (
                  <View className="flex-row items-center gap-2">
                    <CustomTextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder={t('first_name_placeholder')}
                      autoFocus
                    />
                  </View>
                ) : (
                  <Text>{firstName || t('not_provided')}</Text>
                )}
              </ThemedView>

              <ThemedView className="rounded-lg p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-semibold">{t('last_name')}</Text>
                  {isEditingLastName ? (
                    <View className="flex-row gap-2">
                      <Pressable
                        className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
                        onPress={() =>
                          handleCancelEdit(
                            setIsEditingLastName,
                            setLastName,
                            user?.lastname ?? '',
                          )
                        }>
                        <Ionicons
                          name="close"
                          size={16}
                          color="#4B5563"
                          className="mr-1"
                        />
                        <Text className="text-gray-600 dark:text-gray-300 text-sm">
                          {t('cancel')}
                        </Text>
                      </Pressable>
                      <Pressable
                        className="flex-row items-center bg-primary px-3 py-1.5 rounded-full"
                        onPress={handleSaveLastName}>
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#fff"
                          className="mr-1"
                        />
                        <Text className="text-white text-sm">{t('save')}</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
                      onPress={() => setIsEditingLastName(true)}>
                      <Ionicons
                        name="pencil"
                        size={16}
                        color="#4B5563"
                        className="mr-1"
                      />
                      <Text className="text-gray-600 dark:text-gray-300 text-sm">
                        {t('edit')}
                      </Text>
                    </Pressable>
                  )}
                </View>
                {isEditingLastName ? (
                  <View className="flex-row items-center gap-2">
                    <CustomTextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder={t('last_name_placeholder')}
                      autoFocus
                    />
                  </View>
                ) : (
                  <Text>{lastName || t('not_provided')}</Text>
                )}
              </ThemedView>
            </>
          )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}
