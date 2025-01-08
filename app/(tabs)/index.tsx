import CalendarGreeting from '@widgets/calendar/CalendarGreeting'
import { View } from 'react-native'

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <CalendarGreeting />
    </View>
  )
}
