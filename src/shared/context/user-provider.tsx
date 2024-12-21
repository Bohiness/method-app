// src/shared/context/user-provider.tsx
import { authService } from '@shared/api/auth/auth.service'
import { useQueryClient } from '@tanstack/react-query'
import React, { createContext, useContext, useState } from 'react'
import { useStorage } from '../lib/storage/storage.service'
import { UserType } from '../types/user/UserType'

interface UserContextValue {
    user: UserType | null
    isAuthenticated: boolean
    isLoading: boolean
    checkAuth: () => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
    signOut: () => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const storage = useStorage()
    const queryClient = useQueryClient()

    // Проверка текущей сессии
    const checkAuth = async () => {
        try {
            setIsLoading(true)
            const session = await storage.get('user-session', true)

            if (session) {
                try {
                    // Проверяем авторизацию на сервере
                    const userData = await authService.checkAuth()
                    setUser(userData)
                    await storage.set('user-data', userData)
                } catch (error) {
                    console.error('Auth check failed:', error)
                    await signOut()
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Вход в систему
    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const { user, tokens } = await authService.login({ email, password })

            // Сохраняем данные
            await storage.set('user-session', tokens, true)
            await storage.set('user-data', user)

            setUser(user)
        } catch (error) {
            console.error('Sign in failed:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Регистрация
    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        try {
            setIsLoading(true)
            const { user, tokens } = await authService.register({
                email,
                password,
                first_name: firstName,
                last_name: lastName
            })

            // Сохраняем данные
            await storage.set('user-session', tokens, true)
            await storage.set('user-data', user)

            setUser(user)
        } catch (error) {
            console.error('Sign up failed:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Выход из системы
    const signOut = async () => {
        try {
            setIsLoading(true)
            await authService.logout()

            // Очищаем кэш запросов
            queryClient.clear()

            // Удаляем данные сессии
            await storage.remove('user-session')
            await storage.remove('user-data')

            setUser(null)
        } catch (error) {
            console.error('Sign out failed:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const value: UserContextValue = {
        user,
        isAuthenticated: !!user,
        isLoading,
        checkAuth,
        signIn,
        signUp,
        signOut
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}