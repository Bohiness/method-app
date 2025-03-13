import { Colors } from '@shared/constants/colors'
import { storage } from '@shared/lib/storage/storage.service'
import { useColorScheme as useNativeColorScheme } from 'nativewind'
import React, { createContext, useContext, useEffect, useState } from 'react'

// Типы темы
export type Theme = 'light' | 'dark' | 'system'

// Интерфейс контекста темы
interface ThemeContextType {
    theme: Theme
    colorScheme: 'light' | 'dark'
    setTheme: (theme: Theme) => Promise<void>
    colors: typeof Colors.light | typeof Colors.dark
    isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
    children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setThemeState] = useState<Theme>('system')
    const { colorScheme = 'system', setColorScheme } = useNativeColorScheme()
    const systemColorScheme = useNativeColorScheme()

    // Определяем текущую цветовую схему
    const currentColorScheme = theme === 'system'
        ? systemColorScheme.colorScheme || 'light'
        : theme as 'light' | 'dark'

    const isDark = colorScheme === 'dark'
    const colors = Colors[colorScheme as keyof typeof Colors]

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

    // При изменении темы обновляем colorScheme
    useEffect(() => {
        setColorScheme(currentColorScheme)
    }, [currentColorScheme, setColorScheme])

    const context: ThemeContextType = {
        theme,
        colorScheme: currentColorScheme,
        setTheme,
        colors,
        isDark
    }

    return (
        <ThemeContext.Provider value={context}>
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