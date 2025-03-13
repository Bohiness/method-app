import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { filesApiService } from '@shared/api/files/files-api.service'
import { useUser } from '@shared/context/user-provider'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, KeyboardAvoidingView, Platform, View } from 'react-native'

interface EditPhotoProps {
    onBack: () => void
    title: string
}

export const EditPhoto = ({
    onBack,
    title,
}: EditPhotoProps) => {
    const { user, updateUser } = useUser()
    const { t } = useTranslation()
    const [photoUri, setPhotoUri] = useState(user?.profile_photo || '')
    const [error, setError] = useState<string>()
    const [loading, setLoading] = useState(false)

    // Запрос разрешений на доступ к галерее
    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            setError(t('common.errors.photoLibraryDenied'))
            return false
        }
        return true
    }

    // Выбор фото из галереи
    const handleChoosePhoto = async () => {
        const hasPermission = await requestPermissions()
        if (!hasPermission) return

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (!result.canceled) {
                setPhotoUri(result.assets[0].uri)
                setError(undefined)
            }
        } catch (error) {
            console.error('Error picking image:', error)
            setError(t('common.errors.photoPickFailed'))
        }
    }

    // Сделать фото с камеры
    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
            setError(t('common.errors.cameraDenied'))
            return
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (!result.canceled) {
                setPhotoUri(result.assets[0].uri)
                setError(undefined)
            }
        } catch (error) {
            console.error('Error taking photo:', error)
            setError(t('common.errors.photoCaptureFailed'))
        }
    }

    const handleSave = async () => {
        if (!photoUri) {
            setError(t('common.errors.requiredField'))
            return
        }

        setLoading(true)
        try {
            // Создаем FormData и добавляем файл
            const formData = new FormData()
            formData.append('file', {
                uri: photoUri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            } as any)

            // Загружаем файл
            const { file_url } = await filesApiService.uploadFile(formData)

            // Обновляем профиль пользователя с полученным URL
            await updateUser({ profile_photo: file_url })

            onBack()
        } catch (error) {
            console.error('Error updating photo:', error)
            setError(t('common.errors.saveFailed'))
        } finally {
            setLoading(false)
        }
    }

    const canSave = photoUri !== user?.profile_photo && !error && photoUri.length > 0

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-background dark:bg-background-dark"
        >
            <HeaderMenuItem onBack={onBack} title={title} />

            <View className="mt-6 flex-1">
                <View className="flex-1 items-center gap-y-6">
                    {/* Preview фото */}
                    <View className="relative">
                        {photoUri ? (
                            <Image
                                source={{ uri: photoUri }}
                                className="h-40 w-40 rounded-full"
                            />
                        ) : (
                            <View className="h-40 w-40 items-center justify-center rounded-full bg-surface-paper dark:bg-surface-paper-dark">
                                <Icon name="User" size={48} />
                            </View>
                        )}
                    </View>

                    {/* Кнопки выбора фото */}
                    <View className="w-full gap-y-4">
                        <Button
                            onPress={handleChoosePhoto}
                            leftIcon="Image"
                            variant="secondary"
                        >
                            {t('profile.edit.photo.chooseFromGallery')}
                        </Button>

                        <Button
                            onPress={handleTakePhoto}
                            leftIcon="Camera"
                            variant="secondary"
                        >
                            {t('profile.edit.photo.takePhoto')}
                        </Button>
                    </View>

                    {/* Сообщение об ошибке */}
                    {error && (
                        <Text className="text-error">{error}</Text>
                    )}
                </View>

                {/* Кнопка сохранения */}
                <Button
                    onPress={handleSave}
                    disabled={!canSave}
                    className="mt-5"
                    loading={loading}
                >
                    {t('common.save')}
                </Button>
            </View>
        </KeyboardAvoidingView>
    )
}