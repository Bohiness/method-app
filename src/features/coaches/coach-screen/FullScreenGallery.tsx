// src/widgets/coach/CoachProfile/CoachPhotos/FullScreenGallery.tsx
import { CoachImage } from '@shared/types/coaches/CoachType'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { View } from '@shared/ui/view'
import { Image } from 'expo-image'
import { Modal, ScrollView } from 'react-native'


interface FullScreenGalleryProps {
    isVisible: boolean
    photos: CoachImage[]
    initialIndex?: number
    onClose: () => void
}

export const FullScreenGallery: React.FC<FullScreenGalleryProps> = ({
    isVisible,
    photos,
    initialIndex = 0,
    onClose
}) => {
    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            presentationStyle="fullScreen"
        >
            <View className="flex-1 bg-black">
                {/* Header с кнопкой закрытия */}
                <View className="flex-row justify-end p-4">
                    <Button
                        variant="ghost"
                        onPress={onClose}
                    >
                        <Icon name="X" size={24} color="white" />
                    </Button>
                </View>

                {/* Галерея фотографий */}
                <ScrollView
                    horizontal
                    pagingEnabled
                    className="flex-1"
                >
                    {photos.map((photo, index) => (
                        <Image
                            key={index}
                            source={{ uri: photo.image }}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    ))}
                </ScrollView>
            </View>
        </Modal>
    )
}
