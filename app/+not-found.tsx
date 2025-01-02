import { Link, Stack } from 'expo-router'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{
        title: 'Страница не найдена',
        headerShown: false
      }} />
      <SafeAreaView className="flex-1 bg-background-primary">
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-6xl font-bold text-neutral-800 mb-2">404</Text>
          <Text className="text-xl text-neutral-600 mb-8">
            Упс! Страница не найдена
          </Text>
          <Text className="text-base text-neutral-500 text-center mb-8 max-w-sm">
            Страница, которую вы ищете, не существует или была перемещена
          </Text>

          <Link
            href="/home"
            className="bg-primary px-6 py-3 rounded-lg active:opacity-80"
          >
            <Text className="text-white font-medium">
              Вернуться на главную
            </Text>
          </Link>
        </View>
      </SafeAreaView>
    </>
  )
}