import { View } from '@shared/ui/view'
import CalendarGreeting from '@widgets/calendar/CalendarGreeting'

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <CalendarGreeting />
    </View>
  )
}
