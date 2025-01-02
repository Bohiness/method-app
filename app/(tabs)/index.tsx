import { useColorScheme } from '@shared/context/theme-provider'
import CalendarGreeting from '@widgets/calendar/CalendarGreeting'
import { View } from 'react-native'

export default function HomeScreen() {
  const color = useColorScheme()
  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <CalendarGreeting />
      {/* <ThemeDebug /> */}
    </View>
  )
}