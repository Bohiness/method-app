import { FeatureButtonModal } from '@features/components/FeatureButtonModal'
import { Container, View } from '@shared/ui/view'
import { router } from 'expo-router'

export default function HomeScreen() {
  return (
    <Container>
      {/* <CalendarGreeting /> */}
      <View className="gap-y-4 mt-6">
        <View className="flex-row justify-between gap-4">
          <FeatureButtonModal
            title="diary.moodCheckin.title"
            description="diary.moodCheckin.description"
            icon="Rabbit"
            onPress={() => router.push('/(modals)/(diary)/mood')}
          />
        </View>

        <View className="flex-row justify-between gap-4">
          <FeatureButtonModal
            title="diary.startYourDay.title"
            description="diary.startYourDay.description"
            icon="Sun"
            onPress={() => router.push('/(modals)/(diary)/start-your-day')}
          />
          <FeatureButtonModal
            title="diary.mood.eveningReflection"
            description="diary.mood.sumUpYourDay"
            icon="Moon"
            onPress={() => router.push('/(modals)/(diary)/evening-reflection')}
          />
        </View>
      </View>
    </Container>
  )
}

