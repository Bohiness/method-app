import { QuickAccessOption, useQuickAccessSettings, UseQuickAccessSettingsReturn } from '@shared/hooks/systems/useUserQuickAccessOptions'
import React, { createContext, ReactNode, useContext } from 'react'

// Определяем общую структуру состояния настроек
interface AppSettingsState {
    quickAccess: UseQuickAccessSettingsReturn
}

// Тип значения контекста теперь содержит вложенные структуры
type AppSettingsContextValue = AppSettingsState

// Создаем контекст
const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined)

// Компонент Провайдера
export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const quickAccess = useQuickAccessSettings()


    const value: AppSettingsContextValue = {
        quickAccess,
    }

    return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}

// Кастомный хук для использования контекста
export const useAppSettings = (): AppSettingsContextValue => {
    const context = useContext(AppSettingsContext)
    if (context === undefined) {
        throw new Error('useAppSettings must be used within an AppSettingsProvider')
    }
    return context
}

// Экспортируем тип QuickAccessOption для удобства использования в компонентах
export type { QuickAccessOption }
