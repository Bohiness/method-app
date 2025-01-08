// src/app/_layout.tsx
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
  QueryClientProvider
} from '@tanstack/react-query'
import { SplashScreen } from '@widgets/splash-screen'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import 'react-native-reanimated'

import { UserProvider } from '@context/user-provider'
import i18n from '@shared/config/i18n'
import { queryClient } from '@shared/config/query-client'
import { LanguageProvider } from '@shared/context/language-provider'
import { ModalProvider } from '@shared/context/modal-provider'
import { NotificationProvider } from '@shared/context/notification-provider'
import { ThemeProvider } from '@shared/context/theme-provider'
import { SyncManager } from '@shared/ui/system/sync/SyncManager'
import { I18nextProvider } from 'react-i18next'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import './global.css'

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true)


  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <GestureHandlerRootView style={{ flex: 1, padding: 0, margin: 0 }}>
          <QueryClientProvider client={queryClient}>
            <SyncManager />
            <ThemeProvider>
              <View className="flex-1 bg-background dark:bg-background-dark">
                <UserProvider>
                  <BottomSheetModalProvider>
                    <ModalProvider>
                      <SafeAreaProvider>
                        <NotificationProvider>
                          {showSplash ? (
                            <SplashScreen onComplete={() => setShowSplash(false)} />
                          ) : (
                            <Stack screenOptions={{ headerShown: false }}>
                              <Stack.Screen name="index" />
                              <Stack.Screen name="+not-found" />
                            </Stack>
                          )}
                        </NotificationProvider>
                        <StatusBar style="auto" />
                      </SafeAreaProvider >
                    </ModalProvider>
                  </BottomSheetModalProvider>
                </UserProvider>
              </View>
            </ThemeProvider >
          </QueryClientProvider>
        </GestureHandlerRootView >
      </LanguageProvider>
    </I18nextProvider>
  )
}  