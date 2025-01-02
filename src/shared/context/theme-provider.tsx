// src/shared/lib/theme/theme-provider.tsx
import { Colors } from '@shared/constants/colors'
import { storage } from '@shared/lib/storage/storage.service'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme as useNativeColorScheme } from 'react-native'

// Типы темы
export type Theme = 'light' | 'dark' | 'system'


// Интерфейс контекста темы
interface ThemeContextType {
    theme: Theme
    colorScheme: 'light' | 'dark'
    setTheme: (theme: Theme) => Promise<void>
    colors: typeof Colors.light
    isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
    children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const systemColorScheme = useNativeColorScheme()
    const [theme, setThemeState] = useState<Theme>('system')

    // Получаем актуальную цветовую схему
    const colorScheme = theme === 'system'
        ? systemColorScheme || 'light'
        : theme

    // Получаем текущие цвета
    const colors = Colors[colorScheme]

    const isDark = colorScheme === 'dark'

    // Загружаем сохраненную тему при запуске
    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await storage.get<Theme>('app-theme')
            if (savedTheme) {
                setThemeState(savedTheme)
            }
        }
        loadTheme()
    }, [])

    // Функция изменения темы с сохранением
    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme)
        await storage.set('app-theme', newTheme)
    }

    // Применяем класс темы для NativeWind
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement
            console.log('Applying theme class:', colorScheme)
            if (colorScheme === 'dark') {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
            // Добавляем проверку применения класса
            console.log('Current root classes:', root.classList.toString())
            // Проверяем текущие CSS-переменные
            const styles = getComputedStyle(root)
            console.log('Current background variable:', styles.getPropertyValue('--background'))
        }
    }, [colorScheme])

    // Добавляем логирование
    useEffect(() => {
        console.log('Theme State:', {
            systemColorScheme,
            theme,
            colorScheme,
            isDarkMode: colorScheme === 'dark'
        })
    }, [systemColorScheme, theme, colorScheme])


    const context = {
        theme,
        colorScheme,
        setTheme,
        colors,
        isDark
    }

    return (
        <ThemeContext.Provider value={context} >
            {children}
        </ThemeContext.Provider>
    )
}

// Хук для использования темы
export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

// Хук для получения текущих цветов
export const useColors = () => {
    const { colors } = useTheme()
    return colors
}

// Хук для получения текущей цветовой схемы
export const useColorScheme = () => {
    const { colorScheme } = useTheme()
    return colorScheme
}