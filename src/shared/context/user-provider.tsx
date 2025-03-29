// src/shared/context/user-provider.tsx
import { authApiService } from '@shared/api/auth/auth-api.service'
import { userApiService } from '@shared/api/user/user-api.service'
import { QUERY_KEYS } from '@shared/constants/system/QUERY_KEYS'
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS'
import { logger } from '@shared/lib/logger/logger.service'
import { useStorage } from '@shared/lib/storage/storage.service'
import { subscriptionService } from '@shared/lib/subscription/subscription.service'
import { anonymousUserService } from '@shared/lib/user/anonymous.service'
import { csrfService } from '@shared/lib/user/token/csrf.service'
import { tokenService } from '@shared/lib/user/token/token.service'
import { userService } from '@shared/lib/user/user.service'
import { UserType } from '@shared/types/user/UserType'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Updates from 'expo-updates'
import { createContext, useContext, useEffect, useState } from 'react'

interface UserContextValue {
    user: UserType | null
    isAuthenticated: boolean
    isAnonymous: boolean | undefined
    isLoading: boolean | undefined
    checkAuth: () => Promise<void>
    updateUser: (userData: Partial<UserType>) => Promise<UserType>
    signIn: (variables: { email: string; password: string }) => Promise<void>
    signUp: (variables: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>
    signOut: () => Promise<void>
    convertToRegistered: (userData: Partial<UserType>) => Promise<UserType>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserType | null>(null)
    const storage = useStorage()
    const queryClient = useQueryClient()

    const signOutMutation = useMutation({
        mutationFn: async () => {
            try {
                // await authApiService.logout()
                await subscriptionService.logout()
            } catch (error) {
                logger.error(error, 'user provider – signOut', 'UserProvider: Failed to logout:')
            }
        },
        onSettled: async () => {
            queryClient.clear()
            setUser(null)
            await storage.remove(STORAGE_KEYS.USER.USER_DATA)
            await tokenService.clearRefreshAndAccessTokens()
            await csrfService.clearCsrfToken()
            Updates.reloadAsync()
        },
        retry: false
    })

    const signInMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            // Получаем свежий CSRF токен перед входом
            return authApiService.login({ email, password })
        },
        onSuccess: async (response) => {
            setUser(response.user)
        },
        retry: false
    })

    const signUpMutation = useMutation({
        mutationFn: async (data: {
            email: string
            password: string
            firstName: string
            lastName: string
        }) => {
            return authApiService.register({
                email: data.email,
                password: data.password,
                first_name: data.firstName,
                last_name: data.lastName
            })
        },
        onSuccess: async (response) => {
            await tokenService.setTokensToStorage(response.tokens)
            await userService.setUserToStorage(response.user)
            setUser(response.user)
            // Убираем избыточное сохранение токена
        },
        retry: false
    })

    const convertToRegisteredMutation = useMutation({
        mutationFn: async (userData: Partial<UserType>) => {
            // Получаем свежий CSRF токен перед конвертацией
            return anonymousUserService.convertToRegisteredUser(userData)
        },
        onSuccess: async (response) => {
            setUser(response.user)
            await userService.setUserToStorage(response.user)
            // Убираем избыточное сохранение токена
        }
    })

    const checkAuth = async () => {
        logger.debug('UserProvider: Checking authentication...', 'user provider – checkAuth')

        try {
            // Сразу пытаемся проверить сессию на сервере.
            // apiClient внутри обработает CSRF и обновление токенов при необходимости.
            const checkResponse = await authApiService.checkAuthFromServer()
            logger.debug(checkResponse, 'user provider – checkAuth', 'UserProvider: Server auth check response:')

            // Проверяем, что сервер подтвердил аутентификацию и вернул данные
            // (is_authenticated может быть полезен, если API может вернуть 200 OK, но сказать "не аутентифицирован")
            if (checkResponse.is_authenticated && checkResponse.userData) {
                logger.debug('UserProvider: Auth confirmed by server.', 'user provider – checkAuth')
                setUser(checkResponse.userData)
                // Сохраняем свежие данные пользователя
                await userService.setUserToStorage(checkResponse.userData)

                // Сохраняем свежий CSRF токен, если он пришел
                if (checkResponse.csrfToken) {
                    await csrfService.setCsrfTokenToStorage(checkResponse.csrfToken)
                    logger.debug('UserProvider: Updated CSRF token saved.', 'user provider – checkAuth')
                }
            } else {
                // Сервер ответил, но пользователь не аутентифицирован
                logger.warn('UserProvider: Server responded, but user is not authenticated. Signing in anonymously.', 'user provider – checkAuth')
                await signInAnonymously()
            }
        } catch (error) {
            // Ошибка при вызове checkAuthFromServer (сетевая, 401 после неудачного refresh и т.д.)
            logger.error(error, 'user provider – checkAuth', 'UserProvider: Server auth check failed. Signing in anonymously.')
            // Пытаемся войти как анонимный пользователь в случае любой ошибки проверки
            await signInAnonymously()
        }
    }

    const signInAnonymously = async () => {
        try {
            logger.debug('UserProvider: Creating anonymous session...', 'user provider – signInAnonymously')

            const response = await anonymousUserService.getOrCreateAnonymousUser()

            if (!response.user) {
                throw new Error('No user data in response')
            }

            setUser(response.user)
            // Убираем избыточное сохранение токена

            logger.debug('UserProvider: Anonymous session created successfully', 'user provider – signInAnonymously')
        } catch (error) {
            logger.error(error, 'user provider – signInAnonymously', 'UserProvider: Failed to create anonymous session:')
            setUser(null)
            throw error // Пробрасываем ошибку дальше
        }
    }

    const updateUser = async (userData: Partial<UserType>) => {
        try {
            // Получаем свежий CSRF токен перед обновлением профиля
            const result = await userApiService.updateProfile(user!.id, userData)
            await userService.setUserToStorage(result)
            setUser(result)
            return result
        } catch (error) {
            logger.error(error, 'user provider – updateUser', 'UserProvider: Failed to update user data:')
            throw error
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])


    const value: UserContextValue = {
        user,
        isAuthenticated: !!user?.email && !user?.is_anonymous_user,
        isAnonymous: user?.is_anonymous_user,
        isLoading: signInMutation.isPending || signUpMutation.isPending ||
            signOutMutation.isPending || convertToRegisteredMutation.isPending,
        checkAuth,
        updateUser,
        signIn: (variables) => signInMutation.mutateAsync(variables).then(),
        signUp: (variables) => signUpMutation.mutateAsync(variables).then(),
        signOut: () => signOutMutation.mutateAsync().then(),
        convertToRegistered: async (userData) => {
            const result = await convertToRegisteredMutation.mutateAsync(userData)
            return result.user
        }
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
        logger.error('useUser must be used within a UserProvider', 'user provider – useUser')
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}

export const useUpdateProfile = () => {
    const { user } = useUser()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: Partial<UserType>) => {
            return userApiService.updateProfile(user!.id, data)
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData([QUERY_KEYS.USER], updatedUser)
        }
    })
}
