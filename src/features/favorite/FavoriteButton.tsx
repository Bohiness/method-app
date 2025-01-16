// src/features/favorite/FavoriteButton.tsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import Animated, {
    useAnimatedStyle,
    withSequence,
    withSpring
} from 'react-native-reanimated'

import { useColors } from '@shared/context/theme-provider'
import { useFavorite } from '@shared/hooks/coaches/useFavorite'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'

interface FavoriteButtonProps {
    coachId: number
    mini?: boolean
    className?: string
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
    coachId,
    mini = false,
    className
}) => {
    const { t } = useTranslation()
    const { isFavorite, toggleFavorite } = useFavorite()
    const colors = useColors()
    const isFav = isFavorite(coachId)

    // Анимация для иконки сердца
    const heartScale = useAnimatedStyle(() => {
        if (isFav) {
            return {
                transform: [{
                    scale: withSequence(
                        withSpring(1.2),
                        withSpring(1)
                    )
                }]
            }
        }
        return { transform: [{ scale: 1 }] }
    }, [isFav])

    const handlePress = async () => {
        await toggleFavorite(coachId)
    }

    if (mini) {
        return (
            <HapticTab
                onPress={handlePress}
                hapticStyle="medium"
                className="items-center justify-center size-10"
            >
                <Animated.View style={heartScale}>
                    <Icon
                        name="Heart"
                        size={20}
                        color={isFav ? colors.error : colors.secondary.light}
                        fill={isFav ? colors.error : 'transparent'}
                    />
                </Animated.View>
            </HapticTab>
        )
    }

    return (
        <Button
            variant="outline"
            onPress={handlePress}
            className={`flex-row items-center justify-center ${className}`}
        >

            <Animated.View style={[heartScale, { marginRight: 8 }]}>
                <Icon
                    name="Heart"
                    size={16}
                    color={isFav ? colors.error : colors.inactive}
                    fill={isFav ? colors.error : 'transparent'}
                />
            </Animated.View>

            <Text
                variant={isFav ? 'error' : 'secondary'}
                size="sm"
            >
                {isFav
                    ? t('removeFromFavorites')
                    : t('addToFavorites')
                }
            </Text>
        </Button>
    )
}