// src/shared/context/user-provider.tsx
import { authApiService } from '@shared/api/auth/auth-api.service'
import { userApiService } from '@shared/api/user/user-api.service'
import { QUERY_KEYS } from '@shared/constants/QUERY_KEYS'
import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS'
import { logger } from '@shared/lib/logger/logger.service'
import { useStorage } from '@shared/lib/storage/storage.service'
import { subscriptionService } from '@shared/lib/subscription/subscription.service'
import { anonymousUserService } from '@shared/lib/user/anonymous.service'
import { tokenService } from '@shared/lib/user/token/token.service'
import { UserType } from '@shared/types/user/UserType'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
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
                // Получаем свежий CSRF токен перед выходом
                await authApiService.logout()
                await subscriptionService.logout()
            } catch (error) {
                logger.error(error, 'user provider – signOut', 'UserProvider: Failed to logout:')
                // Продолжаем процесс выхода даже при ошибке
            }
        },
        onSettled: async () => {
            queryClient.clear()
            setUser(null)
            await storage.remove(STORAGE_KEYS.USER_DATA)
            router.dismissAll()
            try {
                await signInAnonymously()
                logger.debug('UserProvider: Successfully signed in anonymously after logout', 'user provider – signOut')
            } catch (error) {
                logger.error(error, 'user provider – signOut', 'UserProvider: Failed to sign in anonymously after logout:')
            }
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
            await tokenService.setSession(response.tokens)
            await storage.set(STORAGE_KEYS.USER_DATA, response.user)
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
            await storage.set(STORAGE_KEYS.USER_DATA, response.user)
            // Убираем избыточное сохранение токена
        }
    })

    const checkAuth = async () => {
        logger.debug('UserProvider: Checking authentication...', 'user provider – checkAuth')

        // Сначала получаем CSRF токен
        try {
        } catch (csrfError) {
            logger.error(csrfError, 'user provider – checkAuth', 'UserProvider: Failed to get CSRF token:')
            // Продолжаем проверку аутентификации даже при ошибке CSRF
        }

        const session = await tokenService.getSession()
        logger.debug(session, 'user provider – checkAuth', 'UserProvider: Session status:')

        if (session) {
            try {
                const checkResponse = await authApiService.checkAuth()
                logger.debug(!!checkResponse, 'user provider – checkAuth', 'UserProvider: Got user data:')
                setUser(checkResponse.userData)
                await storage.set(STORAGE_KEYS.USER_DATA, checkResponse.userData)
            } catch (error) {
                logger.error(error, 'user provider – checkAuth', 'UserProvider: Auth check failed:')
                await signInAnonymously()
            }
        } else {
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
            await storage.set(STORAGE_KEYS.USER_DATA, result)
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
