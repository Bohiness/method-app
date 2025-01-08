import { useColorScheme } from '@shared/context/theme-provider'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { Button } from '@shared/ui/button'
import { Slider } from '@shared/ui/slider'
import { Text, Title } from '@shared/ui/styled-text'
import * as Haptics from 'expo-haptics'
import { Angry, Frown, Laugh, Meh, Smile } from 'lucide-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated'

interface MoodLevelStepProps {
  value: number
  onChange: (value: number) => void
  onNext: () => void
  dateNow: Date
}

export const moods = [
  {
    level: 1,
    label: 'diary.mood.moods.terrible',
    icon: (color: string) => <Angry size={32} color={color} />,
    range: [1, 20],
  },
  {
    level: 2,
    label: 'diary.mood.moods.bad',
    icon: (color: string) => <Frown size={32} color={color} />,
    range: [21, 40],
  },
  {
    level: 3,
    label: 'diary.mood.moods.normal',
    icon: (color: string) => <Meh size={32} color={color} />,
    range: [41, 60],
  },
  {
    level: 4,
    label: 'diary.mood.moods.good',
    icon: (color: string) => <Smile size={32} color={color} />,
    range: [61, 80],
  },
  {
    level: 5,
    label: 'diary.mood.moods.excellent',
    icon: (color: string) => <Laugh size={32} color={color} />,
    range: [81, 100],
  },
]

export const MoodLevelStep: React.FC<MoodLevelStepProps> = ({
  value,
  onChange,
  onNext,
  dateNow
}) => {
  const { t } = useTranslation()
  const colorScheme = useColorScheme()
  const { formatDateTime } = useDateTime()
  const [sliderValue, setSliderValue] = useState(50)
  const [previousMoodLevel, setPreviousMoodLevel] = useState(value)
  const [showNextButton, setShowNextButton] = useState(false)


  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch (error) {
      console.log('Haptic feedback not available')
    }
  }, [])

  const getMoodLevel = (sliderValue: number) => {
    const mood = moods.find(
      m => sliderValue >= m.range[0] && sliderValue <= m.range[1]
    )
    return mood?.level || 3
  }

  // Обработчик изменения значения слайдера (во время движения)
  const handleValueChange = useCallback((newValue: number) => {
    setSliderValue(newValue)
    const newMoodLevel = getMoodLevel(newValue)

    if (newMoodLevel !== previousMoodLevel) {
      triggerHaptic()
      setPreviousMoodLevel(newMoodLevel)
      onChange(newMoodLevel)
      setShowNextButton(true)
    }
  }, [value, previousMoodLevel, triggerHaptic, onChange])

  // Обработчик завершения движения слайдера
  const handleSlidingComplete = useCallback((newValue: number) => {
    const newMoodLevel = getMoodLevel(newValue)
    onChange(newMoodLevel)
    setTimeout(onNext, 800)
  }, [onChange, onNext])

  const handleMoodPress = useCallback((level: number) => {
    const mood = moods[level - 1]
    const newSliderValue = (mood.range[0] + mood.range[1]) / 2
    setSliderValue(newSliderValue)

    if (level !== previousMoodLevel) {
      triggerHaptic()
      setPreviousMoodLevel(level)
      onChange(level)
      setTimeout(onNext, 800)
      setShowNextButton(true)
    }
  }, [moods, previousMoodLevel, triggerHaptic, onChange, onNext])


  useEffect(() => {
    const initialMood = moods.find(m => m.level === value)
    if (initialMood) {
      setSliderValue((initialMood.range[0] + initialMood.range[1]) / 2)
      setPreviousMoodLevel(value)
    }
  }, [])

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1.1) }],
  }))

  return (
    <View className="flex-1 relative">
      {/* Основной контент */}
      <View className="flex-1 justify-center -mt-10 px-4">
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
        >
          <Title weight='medium' className="mb-2 text-center">
            {t('diary.moodcheckin.step1.title')}
          </Title>
          <Text variant='secondary' className="mb-8 text-center">
            {`${t('diary.moodcheckin.step1.description')} ${formatDateTime(dateNow)}`}
          </Text>

          <View className="flex-row justify-between px-4 mb-6">
            {moods.map((mood) => (
              <Pressable
                key={mood.level}
                onPress={() => handleMoodPress(mood.level)}
                className="items-center"
              >
                <Animated.View
                  className={`p-4 rounded-full ${value === mood.level
                    ? 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  style={value === mood.level ? animatedIconStyle : undefined}
                >
                  {mood.icon(value === mood.level ?
                    (colorScheme === 'dark' ? '#FFFFFF' : '#374151') :
                    (colorScheme === 'dark' ? '#9CA3AF' : '#9CA3AF')
                  )}
                </Animated.View>
              </Pressable>
            ))}
          </View>

          <View className="px-4">
            <Slider
              value={sliderValue}
              minimumValue={1}
              maximumValue={100}
              step={1}
              onValueChange={handleValueChange}
              onSlidingComplete={handleSlidingComplete}
            />
          </View>

          {value > 0 && (
            <Animated.View
              entering={FadeIn}
              className="mt-8"
            >
              <Text variant="secondary" className="text-center">
                {t(moods[value - 1].label)}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      {/* Контейнер для кнопки с фиксированной позицией внизу */}
      <View className="absolute bottom-0 px-8 pb-8 w-full">
        <Animated.View
          entering={FadeIn}
          className="flex-row justify-end align-center"
        >
          {showNextButton && (
            <Button
              onPress={onNext}
              variant="outline"
              disabled={!showNextButton}
            >
              {t('common.next')}
            </Button>
          )}

        </Animated.View>
      </View>
    </View>
  )
}