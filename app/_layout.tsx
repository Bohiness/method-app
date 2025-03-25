// src/app/_layout.tsx
import { StepIndicator } from '@entities/modals/StepIndicator'
import { SubscriptionScreenProps } from '@features/screens/SubscriptionScreen'
import { initializeServices } from '@shared/config/services-init'
import { useColors, useTheme } from '@shared/context/theme-provider'
import { updateService } from '@shared/lib/update/update.service'
import { FullScreenModalHeader } from '@shared/ui/modals/FullScreenModalHeader'
import { ModalHeader } from '@shared/ui/modals/ModalHeader'
import { SplashScreen } from '@widgets/splash-screen'
import { BlurView } from 'expo-blur'
import { router, Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import 'react-native-get-random-values'
import 'react-native-reanimated'
import Providers from './_providers'
import './global.css'

// Компонент для добавления размытия фона в модальных окнах
function BlurredScreenBackground({ intensity = 40, children, overlayOpacity = 0.3 }) {
  const { isDark } = useTheme()

  return (
    <View style={{ flex: 1 }}>
      {/* Полупрозрачный overlay */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: isDark ? '#000' : '#fff', opacity: overlayOpacity, zIndex: 0 }
        ]}
      />

      {/* Эффект размытия */}
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Контент */}
      <View style={{ flex: 1, zIndex: 10 }}>
        {children}
      </View>
    </View>
  )
}

type StepIndicatorParams = {
  currentStep?: number
  onStepPress?: (step: number) => void
  totalSteps?: number
}

// Отдельный компонент для Stack, чтобы использовать хук useTheme
function AppStack() {
  const colors = useColors()
  const { colorScheme } = useTheme()

  // Настройки для модальных окон с размытием
  const modalScreenOptions = {
    contentStyle: {
      backgroundColor: 'transparent',
    },
    // Компонент для добавления размытия
    background: () => <BlurredScreenBackground />,
  }

  // Настройки для полноэкранных модальных окон с размытием
  const fullScreenModalOptions = {
    contentStyle: {
      backgroundColor: 'transparent',
    },
    // Компонент для добавления размытия
    background: () => <BlurredScreenBackground intensity={30} overlayOpacity={0.2} />,
  }

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
      <Stack.Screen name="(modals)/(diary)/mood"
        options={({ route }: { route: { params?: StepIndicatorParams } }) => ({
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          ...fullScreenModalOptions,
          header: () => (
            <FullScreenModalHeader
              onClose={() => {
                router.dismissTo('/(tabs)')
              }}
              centerContent={
                <StepIndicator
                  currentStep={route.params?.currentStep ?? 1}
                  onStepPress={route.params?.onStepPress}
                  totalSteps={route.params?.totalSteps ?? 4}
                />
              }
            />
          ),
        })}
      />
      <Stack.Screen name="(modals)/(diary)/start-your-day"
        options={({ route }: { route: { params?: StepIndicatorParams } }) => ({
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          ...fullScreenModalOptions,
          header: () => (
            <FullScreenModalHeader
              onClose={() => {
                router.dismissTo('/(tabs)')
              }}
              centerContent={
                <StepIndicator
                  currentStep={route.params?.currentStep ?? 1}
                  totalSteps={route.params?.totalSteps ?? 4}
                  onStepPress={route.params?.onStepPress}
                />
              }
            />
          ),
        })}
      />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(modals)/(diary)/evening-reflection"
        options={({ route }: { route: { params?: StepIndicatorParams } }) => ({
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          ...fullScreenModalOptions,
          header: () => (
            <FullScreenModalHeader
              onClose={() => {
                router.dismissTo('/(tabs)')
              }}
              centerContent={
                <StepIndicator
                  currentStep={route.params?.currentStep ?? 1}
                  onStepPress={route.params?.onStepPress}
                  totalSteps={route.params?.totalSteps ?? 4}
                />
              }
            />
          ),
        })} />
      <Stack.Screen name="(modals)/(plans)/new-task"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          ...modalScreenOptions,
          header: () => (
            <ModalHeader />
          ),
        }}
      />
      <Stack.Screen name="(modals)/(plans)/new-project"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          ...modalScreenOptions,
          header: () => (
            <ModalHeader />
          ),
        }}
      />
      <Stack.Screen name="(modals)/(plans)/settings"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          ...modalScreenOptions,
          header: () => (<ModalHeader />),
        }}
      />
      <Stack.Screen name="(modals)/(plans)/settings/projects-list"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          ...modalScreenOptions,
          header: () => (<ModalHeader />),
        }}
      />
      <Stack.Screen name="(modals)/(plans)/settings/tasks-history"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          ...modalScreenOptions,
          header: () => (<ModalHeader />),
        }}
      />
      <Stack.Screen name="(modals)/(profile)/settings"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          ...modalScreenOptions,
          header: () => (
            <ModalHeader />
          ),
        }}
      />
      <Stack.Screen name="(modals)/(plans)/new-habit"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          ...modalScreenOptions,
          header: () => (<ModalHeader />),
        }}
      />
      <Stack.Screen name="(modals)/(payment)/subscription"
        options={({ route }: { route: { params?: SubscriptionScreenProps } }) => {
          // Извлечение параметров из route.params
          const { selectedPlan, setSelectedPlan } = route.params || {}

          return {
            initialParams: route.params,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
            ...fullScreenModalOptions,
            header: () => null,
          }
        }}
      />
      <Stack.Screen name="(modals)/(profile)/inner/storage-item"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          ...fullScreenModalOptions,
          header: () => (<FullScreenModalHeader
            onClose={() => {
              router.back()
            }}
          />),
        }}
      />
      <Stack.Screen name="(modals)/(profile)/ai-tone-of-voice"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          ...modalScreenOptions,
          headerShown: false,
        }}
      />
      <Stack.Screen name="(modals)/(diary)/journal-editor"
        options={({ route }) => ({
          presentation: 'fullScreenModal',
          animation: 'flip',
          ...fullScreenModalOptions,
          header: () => (
            <FullScreenModalHeader
              onClose={() => {
                // Импортируем journalEditorState и используем его
                const { journalEditorState } = require('@features/diary/JournalEditor')
                if (journalEditorState.saveHandler) {
                  journalEditorState.saveHandler()
                }
                router.dismissTo('/(tabs)')
              }}
            />
          ),
        })}
      />
      <Stack.Screen name="(modals)/(diary)/journal/journal-entry"
        options={({ route }) => {
          const { journalId } = route.params as { journalId?: string } || {}
          return {
            initialParams: { journalId },
            presentation: 'modal',
            animation: 'slide_from_bottom',
            ...modalScreenOptions,
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
      // Инициализация всех сервисов
      await initializeServices()

      // Проверка наличия обновлений
      const hasUpdate = await updateService.checkForUpdates()
      if (hasUpdate) {
        // Если обновление доступно и загружено, перезапустить приложение
        await updateService.reloadApp()
      }
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