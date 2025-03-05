// src/widgets/diary/steps/SleepQualityStep.tsx
import { Slider } from '@shared/ui/slider'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { TransitionScreenProps } from '@widgets/transitions/TransitionContext'
import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { Layout } from 'react-native-reanimated'

type SleepRange = {
    range: [number, number]
    value: 1 | 2 | 3 | 4 | 5
}

const sleepRanges: SleepRange[] = [
    { range: [1, 20], value: 1 },
    { range: [21, 40], value: 2 },
    { range: [41, 60], value: 3 },
    { range: [61, 80], value: 4 },
    { range: [81, 100], value: 5 },
]

interface SleepQualityStepProps extends TransitionScreenProps {
    initialValue?: number
    onChange?: (value: number) => void
}

export const SleepQualityStep: React.FC<SleepQualityStepProps> = ({
    initialValue = 50,
    onChange,
}) => {

    const { t } = useTranslation()
    const [sliderValue, setSliderValue] = useState(initialValue)
    const [currentRange, setCurrentRange] = useState(() =>
        sleepRanges.find(range =>
            initialValue >= range.range[0] && initialValue <= range.range[1]
        ) || sleepRanges[2]
    )

    const triggerHaptic = useCallback(async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        } catch (error) {
            console.log('Haptic feedback not available')
        }
    }, [])

    const updateCurrentRange = useCallback((value: number) => {
        const newRange = sleepRanges.find(range =>
            value >= range.range[0] && value <= range.range[1]
        )
        if (newRange && newRange.value !== currentRange.value) {
            setCurrentRange(newRange)
            triggerHaptic()
        }
    }, [currentRange.value, triggerHaptic])

    // Обработчик для завершения движения слайдера
    const handleSlidingComplete = useCallback((value: number) => {
        if (value >= 1 && value <= 100) {
            setSliderValue(value)
            updateCurrentRange(value)
            onChange?.(value)
        }
    }, [updateCurrentRange, onChange])

    useEffect(() => {
        if (initialValue >= 1 && initialValue <= 100) {
            setSliderValue(initialValue)
            updateCurrentRange(initialValue)
        }
    }, [initialValue])

    return (
        <View className="flex-1 justify-center items-center p-4" variant='default'>

            <View className="justify-center -mt-10 px-4">
                <Title weight='medium' className="mb-2 text-center">
                    {t('diary.startday.sleep.title')}
                </Title>
                <Text variant='secondary' className="mb-8 text-center">
                    {t('diary.startday.sleep.subtitle')}
                </Text>
            </View>


            <View className="flex-row justify-between px-4 mb-6">
                <Title className="mt-4 text-center">
                    <Animated.Text layout={Layout.springify()}>
                        {t(`diary.startday.sleep.quality.${currentRange.value}`)}
                    </Animated.Text>
                </Title>
            </View>

            <View className="w-full">
                <Slider
                    defaultValue={sliderValue}
                    minimumValue={1}
                    maximumValue={100}
                    step={1}
                    onValueChange={updateCurrentRange}
                    onSlidingComplete={handleSlidingComplete}
                    ranges={sleepRanges}
                    leftLabel={t('diary.startday.sleep.quality.start')}
                    rightLabel={t('diary.startday.sleep.quality.end')}
                />
            </View>
        </View>
    )
}