import CalendarGreeting from '@widgets/calendar/CalendarGreeting'
import { View } from 'react-native'

export default function HomeScreen() {
  return (
    <View className="flex-1">
      <CalendarGreeting />
    </View>
  )
}