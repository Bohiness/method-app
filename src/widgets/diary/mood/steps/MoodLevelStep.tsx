import { useTheme } from '@shared/context/theme-provider'
import { useMood } from '@shared/hooks/diary/mood/useMood'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { Slider } from '@shared/ui/slider'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import * as Haptics from 'expo-haptics'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated'

interface MoodLevelStepProps {
  value: number
  onChange: (value: number) => void
  dateNow: Date
  setEnabledNextButton?: (enabled: boolean) => void
  onNextStep?: () => void
}


export function MoodLevelStep({
  value,
  onChange,
  dateNow,
  setEnabledNextButton,
  onNextStep
}: MoodLevelStepProps) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const { formatDateTimeWithTimezoneAndLocale } = useDateTime()
  const { moods } = useMood()

  const [sliderValue, setSliderValue] = useState(() => {
    const initialMood = moods.find(m => m.level === value)
    return initialMood ? (initialMood.range[0] + initialMood.range[1]) / 2 : 50
  })

  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: withSpring(1),
    transform: [{
      scale: withSpring(1.0, {
        mass: 0.5,
        damping: 8,
        stiffness: 100
      })
    }]
  }))

  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch (error) {
      console.log('Haptic feedback not available')
    }
  }, [])

  // Обработчик для изменения значения слайдера
  const handleSliderChange = useCallback((newValue: number) => {
    setSliderValue(newValue)
    const foundMood = moods.find(
      mood => newValue >= mood.range[0] && newValue <= mood.range[1]
    )
    if (foundMood && foundMood.level !== value) {
      triggerHaptic()
      onChange(foundMood.level)
      setEnabledNextButton?.(true)
    }
  }, [value, onChange, triggerHaptic])

  // Обработчик для нажатия на иконки
  const handleMoodPress = useCallback((level: number) => {
    const selectedMood = moods.find(m => m.level === level)
    if (selectedMood) {
      const newSliderValue = (selectedMood.range[0] + selectedMood.range[1]) / 2
      setSliderValue(newSliderValue)
      if (level !== value) {
        triggerHaptic()
        onChange(level)
        setEnabledNextButton?.(true)
      }
    }
  }, [value, onChange, triggerHaptic])

  return (
    <View className="flex-1 relative px-4">
      <View className="flex-1 justify-center -mt-10 px-4">
        <Title weight='medium' className="mb-2 text-center">
          {t('diary.moodcheckin.step1.title')}
        </Title>
        <Text variant='secondary' className="mb-8 text-center">
          {`${t('diary.moodcheckin.step1.description')} ${formatDateTimeWithTimezoneAndLocale(dateNow)}`}
        </Text>

        <View className="flex-row justify-between px-4 mb-6">
          {moods.map((mood) => (
            <Pressable
              key={mood.level}
              onPress={() => handleMoodPress(mood.level)}
              className="items-center"
            >
              <Animated.View
                className={`p-4 rounded-full`}
                style={value === mood.level ? animatedIconStyle : undefined}
              >
                {mood.icon(value === mood.level ?
                  (isDark ? '#FFFFFF' : '#374151') :
                  (isDark ? '#9CA3AF' : '#9CA3AF')
                )}
              </Animated.View>
            </Pressable>
          ))}
        </View>

        <View className="px-4">
          <Slider
            defaultValue={sliderValue}
            minimumValue={1}
            maximumValue={100}
            step={1}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSliderChange}
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
      </View>
    </View>
  )
}