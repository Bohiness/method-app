import { FeatureButtonModal } from '@features/components/FeatureButtonModal'
import { useAppActivities } from '@shared/hooks/systems/useAppActivity'
import { Container, View } from '@shared/ui/view'
import Animated, { FadeInDown } from 'react-native-reanimated'

export default function HomeScreen() {

  const activities = useAppActivities()

  return (
    <Container>
      <View className="gap-y-4 mt-6">
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <View className="flex-row justify-between gap-4">
            <FeatureButtonModal
              title={activities.mood.titleKey}
              description={activities.mood.descriptionKey}
              icon={activities.mood.icon}
              onPress={activities.mood.action}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).springify().delay(150)}>
          <View className="flex-row justify-between gap-4">
            <FeatureButtonModal
              title={activities.startDay.titleKey}
              description={activities.startDay.descriptionKey}
              icon={activities.startDay.icon}
              onPress={activities.startDay.action}
            />
            <FeatureButtonModal
              title={activities.eveningReflection.titleKey}
              description={activities.eveningReflection.descriptionKey}
              icon={activities.eveningReflection.icon}
              onPress={activities.eveningReflection.action}
            />
          </View>
        </Animated.View>
      </View>
    </Container>
  )
}

