// src/widgets/coach/CoachProfile/CoachPhotos/index.tsx
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { CoachImage } from '@shared/types/coaches/CoachType'
import { Text } from '@shared/ui/text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image, useWindowDimensions, View } from 'react-native'
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated'

interface CoachPhotosProps {
    photos: CoachImage[]
    gallery?: string
    title?: string
}

const SPACING = 8

export const PhotosList: React.FC<CoachPhotosProps> = ({
    photos,
    gallery,
    title
}) => {
    const { width } = useWindowDimensions()
    const { t } = useTranslation()
    const scrollX = useSharedValue(0)

    // Вычисляем размер одной фотографии
    const ITEM_SIZE = width / 3 - SPACING * 2

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x
        },
    })

    if (!photos?.length) {
        return null
    }

    const renderPhoto = (photo: CoachImage, index: number) => (
        <View
            key={index}
            style={{ width: ITEM_SIZE }}
            className="m-2"
        >
            <Image
                source={{ uri: photo.image }}
                className="w-full rounded-2xl"
                style={{ height: ITEM_SIZE }}
                resizeMode="cover"
            />
        </View>
    )

    const handleShowAll = () => {
        // Логика для показа всех фото
    }

    return (
        <View>
            {/* Заголовок с кнопкой "Показать все" */}
            <View className="flex-row justify-between items-center px-4 mb-2">
                <Text weight="semibold">
                    {title}
                </Text>
                {photos.length > 6 && (
                    <HapticTab onPress={handleShowAll}>
                        <Text
                            variant="tint"
                            size="sm"
                            className="mr-1"
                        >
                            {t('common.showAll')}
                        </Text>
                    </HapticTab>
                )}
            </View>

            {/* Карусель фотографий */}
            <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SPACING }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                className="overflow-visible"
            >
                {photos.slice(0, 6).map((photo, index) => renderPhoto(photo, index))}
            </Animated.ScrollView>
        </View>
    )
}

