import { HighlightedText } from '@shared/lib/utils/parsers/HighlightedText'
import { Factor } from '@shared/types/diary/mood/MoodType'
import { Badge } from '@shared/ui/badge'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'

interface SelectedFactorsProps {
    selectedFactors: number[]
    factors: Factor[]
    onRemoveFactor: (id: number) => void
    containerClassName?: string
    title?: string
    showTitle?: boolean
    minimumRequired?: number
}

export function SelectedFactors({
    selectedFactors,
    factors,
    onRemoveFactor,
    containerClassName = '',
    title,
    showTitle = true,
    minimumRequired = 1
}: SelectedFactorsProps) {
    const { t } = useTranslation()
    const selectedFactorsCount = selectedFactors.length

    if (!selectedFactors.length) {
        return null
    }

    return (
        <View className={`flex-row flex-wrap justify-start items-center ${containerClassName}`}>
            {showTitle && (
                <Text className="text-base font-medium mr-2">
                    {title || t('common.selectedFactors')}:
                </Text>
            )}

            <View className="flex-row flex-wrap">
                {factors
                    .filter(factor => selectedFactors.includes(factor.id))
                    .map((factor, index, arr) => (
                        <HighlightedText
                            key={factor.id}
                            text={factor.name}
                            onRemove={onRemoveFactor}
                            id={factor.id}
                            canDelete={selectedFactorsCount > minimumRequired}
                            isLast={index === arr.length - 1}
                        />
                    ))}
            </View>
        </View>
    )
}

// Альтернативная версия компонента с собственной реализацией бейджа
// если HighlightedText не подходит по дизайну

export function SelectedFactorsBadges({
    selectedFactors,
    factors,
    onRemoveFactor,
    containerClassName = '',
    title,
    showTitle = true,
    minimumRequired = 0
}: SelectedFactorsProps) {
    const { t } = useTranslation()
    const selectedFactorsCount = selectedFactors.length

    if (!selectedFactors.length) {
        return null
    }

    return (
        <View className={`flex-row flex-wrap justify-center items-center ${containerClassName}`}>
            {showTitle && (
                <Text className="text-base font-medium mr-2">
                    {title || t('common.selectedFactors')}:
                </Text>
            )}

            <Animated.View className="flex-row flex-wrap justify-center w-full" layout={Layout}>
                {factors
                    .filter(factor => selectedFactors.includes(factor.id))
                    .map((factor, index) => (
                        <Animated.View
                            key={factor.id}
                            entering={FadeIn.delay(index * 100).duration(300)}
                            exiting={FadeOut.duration(200)}
                            layout={Layout}
                        >
                            <Badge
                                variant="outline"
                                removable={selectedFactorsCount > minimumRequired}
                                onRemove={() => onRemoveFactor(factor.id)}
                                style={{ margin: 4 }}
                            >
                                {factor.name}
                            </Badge>
                        </Animated.View>
                    ))}
            </Animated.View>
        </View>
    )
}
