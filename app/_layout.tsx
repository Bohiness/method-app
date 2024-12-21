// src/app/_layout.tsx
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { SplashScreen } from '@widgets/splash-screen'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import 'react-native-reanimated'

import { UserProvider } from '@context/user-provider'
import { useColorScheme } from '@hooks/systems/colors/useColorScheme'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import './global.css'

import { ModalProvider } from '@shared/context/modal-provider'
import { ThemeProvider } from '@shared/context/theme-provider'
import { verifyInstallation } from 'nativewind'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [showSplash, setShowSplash] = useState(true)
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  if (!loaded) {
    return null
  }

  verifyInstallation()

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={new QueryClient()}>
          <ThemeProvider>
            <UserProvider>
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
                  <StatusBar style="auto" />
                </SafeAreaProvider >
              </ModalProvider>
            </UserProvider>
          </ThemeProvider >
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView >


  )
}
