// app/index.tsx
import { storage } from '@shared/lib/storage/storage.service'
import { SplashScreen } from '@widgets/splash-screen'
import { useFonts } from 'expo-font'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import 'react-native-get-random-values'

export default function IndexScreen() {
  // Хук роутера, чтобы вызывать router.replace(...)
  const router = useRouter()

  // Состояние, чтобы понимать, когда всё готово
  const [isAppReady, setIsAppReady] = useState(false)


  // Пример загрузки шрифтов (если это нужно)
  const [fontsLoaded] = useFonts({
    SpaceMono: require('@assets/fonts/SpaceMono-Regular.ttf'),
    Manrope: require('@assets/fonts/Manrope-VariableFont_wght.ttf'),
  })


  async function checkAppState() {
    if (!fontsLoaded) return

    try {
      const onboardingCompleted = await storage.get('onboarding-completed')

      if (onboardingCompleted) {
        router.replace('/(tabs)')
      } else {
        router.replace('/onboarding')
      }
    } catch (error) {
      router.replace('/onboarding')
    } finally {
      setIsAppReady(true)
    }
  }

  useEffect(() => {
    checkAppState()
  }, [fontsLoaded])

  if (!fontsLoaded || !isAppReady) {
    return <SplashScreen onComplete={() => setIsAppReady(true)} />
  }

  return null
}