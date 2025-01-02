// src/shared/context/user-provider.tsx
import { authApiService } from '@shared/api/auth/auth-api.service'
import { anonymousUserService } from '@shared/lib/user/anonymous.service'
import { tokenService } from '@shared/lib/user/token/token.service'
import { useQueryClient } from '@tanstack/react-query'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useStorage } from '../lib/storage/storage.service'
import { UserType } from '../types/user/UserType'

interface UserContextValue {
    user: UserType | null
    isAuthenticated: boolean
    isAnonymous: boolean
    isLoading: boolean
    checkAuth: () => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
    signOut: () => Promise<void>
    convertToRegistered: (userData: Partial<UserType>) => Promise<UserType>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const storage = useStorage()
    const queryClient = useQueryClient()


    // Выход из системы
    const signOut = async () => {
        try {
            console.debug('UserProvider: Signing out...')
            setIsLoading(true)
            await authApiService.logout()

            // Очищаем кэш запросов
            queryClient.clear()

            // После выхода создаем нового анонимного пользователя
            await signInAnonymously()
        } catch (error) {
            console.error('UserProvider: Sign out failed:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }


    // Проверка текущей сессии
    const checkAuth = async () => {
        try {
            console.debug('UserProvider: Checking authentication...')
            setIsLoading(true)

            const session = await tokenService.getSession()
            console.debug('UserProvider: Session status:', !!session)

            if (session) {
                try {
                    // Проверяем авторизацию на сервере
                    const checkResponse = await authApiService.checkAuth()
                    console.debug('UserProvider: Got user data:', !!checkResponse)
                    setUser(checkResponse.userData)
                    // Сохраняем данные
                    await storage.set('user-data', checkResponse.userData)
                    await storage.set('csrf-token', checkResponse.csrfToken)

                } catch (error) {
                    console.error('UserProvider: Auth check failed:', error)
                    // Если проверка не удалась, пробуем получить анонимного пользователя
                    await signInAnonymously()
                }
            } else {
                // Если нет сессии, создаем анонимного пользователя
                await signInAnonymously()
            }
        } finally {
            setIsLoading(false)
        }
    }


    const signInAnonymously = async () => {
        try {
            console.debug('UserProvider: Creating anonymous session...')
            const response = await anonymousUserService.getOrCreateAnonymousUser()

            if (!response.user) {
                throw new Error('No user data in response')
            }

            setUser(response.user)
            console.debug('UserProvider: Anonymous session created successfully')
        } catch (error) {
            console.error('UserProvider: Failed to create anonymous session:', error)
            setUser(null)
            throw error // Пробрасываем ошибку дальше
        }
    }

    // Вход в систему
    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const { user, tokens } = await authApiService.login({ email, password })

            // Сохраняем данные
            await tokenService.setSession(tokens)
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
            const { user, tokens } = await authApiService.register({
                email,
                password,
                first_name: firstName,
                last_name: lastName
            })

            // Сохраняем данные
            await tokenService.setSession(tokens)
            await storage.set('user-data', user)

            setUser(user)
        } catch (error) {
            console.error('Sign up failed:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Конвертация анонимного пользователя в зарегистрированного
    const convertToRegistered = async (userData: Partial<UserType>) => {
        try {
            console.debug('UserProvider: Converting anonymous user...')
            setIsLoading(true)

            const { user: registeredUser } = await anonymousUserService.convertToRegisteredUser(userData)
            console.debug('UserProvider: User converted successfully')
            setUser(registeredUser)

            return registeredUser
        } catch (error) {
            console.error('UserProvider: Failed to convert user:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const isAnonymous = !user?.email

    const value: UserContextValue = {
        user,
        isAuthenticated: !!user?.email,
        isAnonymous,
        isLoading,
        checkAuth,
        signIn,
        signUp,
        signOut,
        convertToRegistered
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