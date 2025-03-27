// src/app/_layout.tsx
import { SubscriptionScreenProps } from '@features/screens/SubscriptionScreen'
import { initializeServices } from '@shared/config/services-init'
import { APP_ROUTES } from '@shared/constants/system/app-routes'
import { useColors } from '@shared/context/theme-provider'
import { SplashScreen } from '@widgets/splash-screen'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import 'react-native-get-random-values'
import 'react-native-reanimated'
import { StackAnimationTypes } from 'react-native-screens'
import Providers from './_providers'
import './global.css'


// Настройки для модальных окон с размытием
export const bottomModalScreenOptions = {
  presentation: 'modal' as const,
  animation: 'slide_from_bottom' as StackAnimationTypes,
  headerShown: false,
  contentStyle: {
    backgroundColor: 'transparent',
  },
}

// Настройки для полноэкранных модальных окон с размытием
export const fullScreenModalOptions = {
  presentation: 'fullScreenModal' as const,
  animation: 'slide_from_bottom' as StackAnimationTypes,
  headerShown: false,
  contentStyle: {
    backgroundColor: 'transparent',
  },
}


// Отдельный компонент для Stack, чтобы использовать хук useTheme
function AppStack() {
  const colors = useColors()

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(coach)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      <Stack.Screen name={APP_ROUTES.MODALS.DIARY.MOOD} options={{ ...fullScreenModalOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.DIARY.START_YOUR_DAY} options={{ ...fullScreenModalOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.DIARY.EVENING_REFLECTION} options={{ ...fullScreenModalOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.DIARY.BEAUTIFUL_DIARY} options={{ ...bottomModalScreenOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.DIARY.JOURNAL.SUCCESS} options={{ ...bottomModalScreenOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.DIARY.JOURNAL.EDITOR}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'flip',
        }}
      />

      <Stack.Screen name={APP_ROUTES.MODALS.PLANS.NEW_TASK} options={{ ...bottomModalScreenOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.PLANS.NEW_PROJECT} options={{ ...bottomModalScreenOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.PLANS.NEW_HABIT} options={{ ...bottomModalScreenOptions }} />

      <Stack.Screen name={APP_ROUTES.MODALS.PLANS.SETTINGS.BASE} options={{ ...bottomModalScreenOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.PLANS.SETTINGS.PROJECTS_LIST} options={{ ...bottomModalScreenOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.PLANS.SETTINGS.TASKS_HISTORY} options={{ ...bottomModalScreenOptions }} />

      <Stack.Screen name={APP_ROUTES.MODALS.SETTINGS.BASE} options={{ ...bottomModalScreenOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.SETTINGS.STORAGE_ITEM} options={{ ...fullScreenModalOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.SETTINGS.AI_TONE_OF_VOICE} options={{ ...bottomModalScreenOptions }} />
      <Stack.Screen name={APP_ROUTES.MODALS.SETTINGS.QUICK_ACCESS} options={{ ...bottomModalScreenOptions }} />

      <Stack.Screen name={APP_ROUTES.MODALS.PAYMENT.SUBSCRIPTION}
        options={({ route }: { route: { params?: SubscriptionScreenProps } }) => {
          // Извлечение параметров из route.params
          const { selectedPlan, setSelectedPlan } = route.params || {}

          return {
            initialParams: route.params,
            ...fullScreenModalOptions,
            header: () => null,
          }
        }}
      />

      <Stack.Screen name={APP_ROUTES.MODALS.DIARY.JOURNAL.ENTRY}
        options={({ route }) => {
          const { journalId } = route.params as { journalId?: string } || {}
          return {
            initialParams: { journalId },
            ...bottomModalScreenOptions,
            headerShown: false,
          }
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const setupApp = async () => {
      await initializeServices()
    }

    setupApp()
  }, [])

  return (
    <Providers>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <AppStack />
      )}
    </Providers>
  )
}  