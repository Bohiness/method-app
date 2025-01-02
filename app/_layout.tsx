import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { QueryClientProvider } from '@tanstack/react-query'
import { SplashScreen } from '@widgets/splash-screen'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useRef, useState } from 'react'
import 'react-native-reanimated'

import { UserProvider } from '@context/user-provider'
import i18n from '@shared/config/i18n'
import { queryClient } from '@shared/config/query-client'
import { ModalProvider } from '@shared/context/modal-provider'
import { ThemeProvider, useTheme } from '@shared/context/theme-provider'
import { SyncManager } from '@shared/ui/system/sync/SyncManager'
import * as Notifications from 'expo-notifications'
import { I18nextProvider } from 'react-i18next'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import './global.css'

// Настройка уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Создаем отдельный компонент для контента
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true)
  const { isDark } = useTheme()

  const containerClasses = `flex-1 ${isDark && 'dark'} px-1`

  return (
    <View className={containerClasses}>
      <UserProvider>
        <BottomSheetModalProvider>
          <ModalProvider>
            <SafeAreaProvider>
              {showSplash ? (
                <SplashScreen onComplete={() => setShowSplash(false)} />
              ) : (
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              )}
              <StatusBar style={isDark ? 'dark' : 'light'} />
            </SafeAreaProvider>
          </ModalProvider>
        </BottomSheetModalProvider>
      </UserProvider>
    </View>
  )
}

export default function RootLayout() {
  const notificationListener = useRef<any>()
  const responseListener = useRef<any>()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Получено уведомление:', notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Нажатие на уведомление:', response)
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  if (!loaded) {
    return null
  }

  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <SyncManager />
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  )
}