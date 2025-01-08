// src/shared/ui/debug/ThemeDebug.tsx
import { useTheme } from '@shared/context/theme-provider'
import React from 'react'
import { Text, View } from 'react-native'

export const ThemeDebug = () => {
    const { theme, colorScheme } = useTheme()

    return (
        <View className="p-4">
            <Text className="text-text dark:text-text-dark">
                Current Theme: {theme}
            </Text>
            <Text className="text-text dark:text-text-dark">
                Color Scheme: {colorScheme}
            </Text>

            <View className="mt-4 p-4 bg-background dark:bg-background-dark">
                <Text className="text-text dark:text-text-dark">
                    Background Color Test
                </Text>
            </View>

            <View className="mt-4 p-4 bg-surface-paper dark:bg-surface-paper-dark">
                <Text className="text-text dark:text-text-dark">
                    Surface Color Test
                </Text>
            </View>

            <View className="mt-4 p-4 bg-accent">
                <Text className="text-text-dark">
                    Accent Color Test
                </Text>
            </View>
        </View>
    )
}