// src/app/_layout.tsx
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
  QueryClientProvider
} from '@tanstack/react-query'
import { SplashScreen } from '@widgets/splash-screen'
import { router, Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import 'react-native-reanimated'

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
import { NotificationHandler } from '@shared/lib/notifications/notification-handler'
import { FullScreenModalHeader } from '@shared/ui/modals/FullScreenModalHeader'
import { FullScreenModalHeaderWithNoise } from '@shared/ui/modals/FullScreenModalHeaderWithNoise'
import { ModalHeader } from '@shared/ui/modals/ModalHeader'
import { SyncManager } from '@shared/ui/system/sync/SyncManager'
import { ToggleSwitch } from '@shared/ui/toggle-switch'
import { ContainerScreen } from '@shared/ui/view'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import './global.css'

type StepIndicatorParams = {
  currentStep?: number
  onStepPress?: (step: number) => void
  totalSteps?: number
}

export default function RootLayout() {
  const { t } = useTranslation()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Инициализация сервисов при запуске приложения
    initializeServices()
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1, padding: 0, margin: 0 }}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <LanguageProvider>
              <ThemeProvider>
                <BottomSheetModalProvider>
                  <SafeAreaProvider>
                    {/* <AIProvider> */}
                    <SyncManager />
                    <ContainerScreen>
                      <NotificationProvider>
                        <NotificationHandler>
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
                                      header: () => (
                                        <FullScreenModalHeaderWithNoise
                                          variant='surface'
                                          centerContent={
                                            <ToggleSwitch
                                              value={selectedPlan === 'premium_ai'}
                                              onChange={(isChecked) => setSelectedPlan?.(isChecked ? 'premium_ai' : 'premium')}
                                              leftLabel={t('screens.subscription.toggle.premium')}
                                              rightLabel={t('screens.subscription.toggle.premium_ai')}
                                              size="md"
                                              disabled={false}
                                            />
                                          }
                                          onClose={() => {
                                            router.back()
                                          }}
                                        />
                                      ),
                                    }
                                  }}
                                />
                                <Stack.Screen name="(modals)/(profile)/inner/storage-item"
                                  options={{
                                    presentation: 'fullScreenModal',
                                    animation: 'slide_from_bottom',
                                    header: () => (<FullScreenModalHeader />),
                                  }}
                                />
                              </Stack>
                            )}
                          </ModalProvider>
                        </NotificationHandler>
                      </NotificationProvider>
                    </ContainerScreen>
                    {/* </AIProvider> */}
                  </SafeAreaProvider>
                </BottomSheetModalProvider>
              </ThemeProvider>
            </LanguageProvider>
          </UserProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  )
}  