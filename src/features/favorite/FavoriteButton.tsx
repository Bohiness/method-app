// src/features/favorite/FavoriteButton.tsx
import { Heart } from 'lucide-react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import Animated, {
    useAnimatedStyle,
    withSequence,
    withSpring
} from 'react-native-reanimated'

import { useColors } from '@shared/context/theme-provider'
import { useFavorite } from '@shared/hooks/coaches/useFavorite'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Button } from '@shared/ui/button'
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
    const { isFavorite, toggleFavorite, isToggling } = useFavorite()
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
                disabled={isToggling}
                hapticStyle="medium"
                className="items-center justify-center bg-surface-paper rounded-lg size-10"
            >
                {isToggling ? (
                    <ActivityIndicator
                        size="small"
                        color={colors.text}
                    />
                ) : (
                    <Animated.View style={heartScale}>
                        <Heart
                            size={20}
                            color={isFav ? colors.error : colors.inactive}
                            fill={isFav ? colors.error : 'none'}
                        />
                    </Animated.View>
                )}
            </HapticTab>
        )
    }

    return (
        <Button
            variant="outline"
            onPress={handlePress}
            disabled={isToggling}
            className={`flex-row items-center justify-center ${className}`}
        >
            {isToggling ? (
                <ActivityIndicator
                    size="small"
                    color={colors.text}
                    style={{ marginRight: 8 }}
                />
            ) : (
                <Animated.View style={[heartScale, { marginRight: 8 }]}>
                    <Heart
                        size={16}
                        color={isFav ? colors.error : colors.inactive}
                        fill={isFav ? colors.error : 'none'}
                    />
                </Animated.View>
            )}

            <Text
                variant={isFav ? 'error' : 'secondary'}
                size="sm"
            >
                {isToggling
                    ? t('updating')
                    : isFav
                        ? t('removeFromFavorites')
                        : t('addToFavorites')
                }
            </Text>
        </Button>
    )
}