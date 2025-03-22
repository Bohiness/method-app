// src/app/_layout.tsx
import { UserProvider } from '@context/user-provider'
import { StepIndicator } from '@entities/modals/StepIndicator'
import { SubscriptionScreenProps } from '@features/screens/SubscriptionScreen'
import i18n from '@shared/config/i18n'
import { queryClient } from '@shared/config/query-client'
import { initializeServices } from '@shared/config/services-init'
import { LanguageProvider } from '@shared/context/language-provider'
import { ModalProvider } from '@shared/context/modal-provider'
import { NotificationProvider } from '@shared/context/notification-provider'
import { ThemeProvider } from '@shared/context/theme-provider'
import { FullScreenModalHeader } from '@shared/ui/modals/FullScreenModalHeader'
import { ModalHeader } from '@shared/ui/modals/ModalHeader'
import { SyncManager } from '@shared/ui/system/sync/SyncManager'
import { ContainerScreen } from '@shared/ui/view'
import {
  QueryClientProvider
} from '@tanstack/react-query'
import { SplashScreen } from '@widgets/splash-screen'
import { router, Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-get-random-values'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import './global.css'

type StepIndicatorParams = {
  currentStep?: number
  onStepPress?: (step: number) => void
  totalSteps?: number
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    initializeServices()
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1, padding: 0, margin: 0 }}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <LanguageProvider>
              <ThemeProvider>
                <SafeAreaProvider>
                  <SyncManager />
                  <ContainerScreen>
                    <NotificationProvider>
                      <ModalProvider>
                        {showSplash ? (
                          <SplashScreen onComplete={() => setShowSplash(false)} />
                        ) : (
                          <Stack>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                            <Stack.Screen name="(coach)" options={{ headerShown: false }} />
                            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
                            <Stack.Screen name="(modals)/(diary)/mood"
                              options={({ route }: { route: { params?: StepIndicatorParams } }) => ({
                                presentation: 'fullScreenModal',
                                animation: 'slide_from_bottom',
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
                                header: () => (
                                  <ModalHeader />
                                ),
                              }}
                            />
                            <Stack.Screen name="(modals)/(plans)/new-project"
                              options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                                header: () => (
                                  <ModalHeader />
                                ),
                              }}
                            />
                            <Stack.Screen name="(modals)/(plans)/settings"
                              options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                                header: () => (<ModalHeader />),
                              }}
                            />
                            <Stack.Screen name="(modals)/(plans)/settings/projects-list"
                              options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                                header: () => (<ModalHeader />),
                              }}
                            />
                            <Stack.Screen name="(modals)/(plans)/settings/tasks-history"
                              options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                                header: () => (<ModalHeader />),
                              }}
                            />
                            <Stack.Screen name="(modals)/(profile)/settings"
                              options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                                header: () => (
                                  <ModalHeader />
                                ),
                              }}
                            />
                            <Stack.Screen name="(modals)/(plans)/new-habit"
                              options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
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
                                  header: () => null,
                                }
                              }}
                            />
                            <Stack.Screen name="(modals)/(profile)/inner/storage-item"
                              options={{
                                presentation: 'fullScreenModal',
                                animation: 'slide_from_bottom',
                                header: () => (<FullScreenModalHeader
                                  onClose={() => {
                                    router.back()
                                  }}
                                />),
                              }}
                            />
                          </Stack>
                        )}
                      </ModalProvider>
                    </NotificationProvider>
                  </ContainerScreen>
                </SafeAreaProvider>
              </ThemeProvider>
            </LanguageProvider>
          </UserProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  )
}  