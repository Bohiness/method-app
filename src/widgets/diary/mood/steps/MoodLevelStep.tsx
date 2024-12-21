// src/features/diary/mood/steps/index.ts
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/styled-text'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut
} from 'react-native-reanimated'

// MoodLevelStep
interface MoodLevelStepProps {
  value: number
  onChange: (value: number) => void
  onNext: () => void
}

export const MoodLevelStep: React.FC<MoodLevelStepProps> = ({
  value,
  onChange,
  onNext,
}) => {
  const { t } = useTranslation('diary.mood')

  const moods = [
    { level: 1, label: t('moods.terrible'), color: '#EF4444' },
    { level: 2, label: t('moods.bad'), color: '#F59E0B' },
    { level: 3, label: t('moods.normal'), color: '#FCD34D' },
    { level: 4, label: t('moods.good'), color: '#34D399' },
    { level: 5, label: t('moods.excellent'), color: '#10B981' },
  ]


  return (
    <Animated.View
      className="flex-1 p-4"
      entering={FadeIn}
      exiting={FadeOut}
    >
      <Text className="mb-8 text-center text-xl">{t('moods.how_are_you_feeling')}</Text>

      <View className="flex-row flex-wrap justify-center gap-4">
        {moods.map((mood) => (
          <Animated.View
            key={mood.level}
            style={{

            }}
          >
            <Button
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                onChange(mood.level)
              }}
              style={{ backgroundColor: mood.color }}
              className="h-24 w-24 items-center justify-center rounded-2xl"
            >
              <Text style={{ color: '#fff' }}>{mood.label}</Text>
            </Button>
          </Animated.View>
        ))}
      </View>

      <Button
        onPress={onNext}
        className="mt-auto"
        variant="tint"
      >
        {t('common.next')}
      </Button>
    </Animated.View>
  )
}
