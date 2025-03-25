import { FeatureButtonModal } from '@features/components/FeatureButtonModal'
import { useEveningReflection } from '@shared/hooks/diary/eveningreflection/useEveningReflection'
import { useMoodCheckin } from '@shared/hooks/diary/mood/useMoodCheckin'
import { useStartDay } from '@shared/hooks/diary/startday/useStartDay'
import { Container, View } from '@shared/ui/view'
import Animated, { FadeInDown } from 'react-native-reanimated'

export default function HomeScreen() {

  const { openMoodCheckinModal } = useMoodCheckin()
  const { openEveningReflectionModal } = useEveningReflection()
  const { openStartDayModal } = useStartDay()

  return (
    <Container>
      <View className="gap-y-4 mt-6">
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <View className="flex-row justify-between gap-4">
            <FeatureButtonModal
              title="diary.moodcheckin.title"
              description="diary.moodcheckin.description"
              icon="Rabbit"
              onPress={openMoodCheckinModal}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).springify().delay(150)}>
          <View className="flex-row justify-between gap-4">
            <FeatureButtonModal
              title="diary.startYourDay.title"
              description="diary.startYourDay.description"
              icon="Sun"
              onPress={openStartDayModal}
            />
            <FeatureButtonModal
              title="diary.eveningreflection.title"
              description="diary.eveningreflection.description"
              icon="Moon"
              onPress={openEveningReflectionModal}
            />
          </View>
        </Animated.View>
      </View>
    </Container>
  )
}

