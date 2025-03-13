import { FeatureButtonModal } from '@features/components/FeatureButtonModal'
import { useEveningReflection } from '@shared/hooks/diary/eveningreflection/useEveningReflection'
import { useMoodCheckin } from '@shared/hooks/diary/mood/useMoodCheckin'
import { useStartDay } from '@shared/hooks/diary/startday/useStartDay'
import { Container, View } from '@shared/ui/view'

export default function HomeScreen() {

  const { openMoodCheckinModal } = useMoodCheckin()
  const { openEveningReflectionModal } = useEveningReflection()
  const { openStartDayModal } = useStartDay()

  return (
    <Container>
      {/* <CalendarGreeting /> */}
      <View className="gap-y-4 mt-6">
        <View className="flex-row justify-between gap-4">
          <FeatureButtonModal
            title="diary.moodCheckin.title"
            description="diary.moodCheckin.description"
            icon="Rabbit"
            onPress={openMoodCheckinModal}
          />
        </View>

        <View className="flex-row justify-between gap-4">
          <FeatureButtonModal
            title="diary.startYourDay.title"
            description="diary.startYourDay.description"
            icon="Sun"
            onPress={openStartDayModal}
          />
          <FeatureButtonModal
            title="diary.mood.eveningReflection"
            description="diary.mood.sumUpYourDay"
            icon="Moon"
            onPress={openEveningReflectionModal}
          />
        </View>
      </View>
    </Container>
  )
}

