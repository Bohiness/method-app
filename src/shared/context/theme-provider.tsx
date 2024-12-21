// src/shared/providers/ThemeProvider.tsx
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, Theme } from '@react-navigation/native'
import { useColorScheme } from '@shared/hooks/systems/colors/useColorScheme.web'
import React from 'react'
import { View } from 'react-native'

type Props = {
    children: React.ReactNode
}

export function ThemeProvider({ children }: Props) {
    const colorScheme = useColorScheme()

    // Определяем тему для React Navigation
    const navigationTheme: Theme = colorScheme === 'dark' ? {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: '#FFFFFF',
            background: '#000000',
            text: '#FFFFFF',
        }
    } : {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: '#0a7ea4',
            background: '#FFFFFF',
            text: '#1A202C',
        }
    }

    return (
        <NavigationThemeProvider value={navigationTheme}>
            <View className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}>
                {children}
            </View>
        </NavigationThemeProvider>
    )
}