// src/shared/context/user-provider.tsx
import { authApiService } from '@shared/api/auth/auth-api.service'
import { userApiService } from '@shared/api/user/user-api.service'
import { useStorage } from '@shared/lib/storage/storage.service'
import { anonymousUserService } from '@shared/lib/user/anonymous.service'
import { tokenService } from '@shared/lib/user/token/token.service'
import { UserType } from '@shared/types/user/UserType'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
            return authApiService.logout()
        },
        onSuccess: async () => {
            queryClient.clear()
            setUser(null)
            await storage.clear()
            await signInAnonymously()
        }
    })

    const signInMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            return authApiService.login({ email, password })
        },
        onSuccess: async ({ user, tokens }) => {
            setUser(user)
        }
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
        onSuccess: async ({ user, tokens }) => {
            await tokenService.setSession(tokens)
            await storage.set('user-data', user)
            setUser(user)
        }
    })

    const convertToRegisteredMutation = useMutation({
        mutationFn: async (userData: Partial<UserType>) => {
            return anonymousUserService.convertToRegisteredUser(userData)
        },
        onSuccess: async ({ user: registeredUser }) => {
            setUser(registeredUser)
            await storage.set('user-data', registeredUser)
        }
    })

    const checkAuth = async () => {
        console.debug('UserProvider: Checking authentication...')

        const session = await tokenService.getSession()
        console.debug('UserProvider: Session status:', !!session)

        if (session) {
            try {
                const checkResponse = await authApiService.checkAuth()
                console.debug('UserProvider: Got user data:', !!checkResponse)
                setUser(checkResponse.userData)
                await storage.set('user-data', checkResponse.userData)
                await storage.set('csrf-token', checkResponse.csrfToken)
            } catch (error) {
                console.error('UserProvider: Auth check failed:', error)
                await signInAnonymously()
            }
        } else {
            await signInAnonymously()
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

    const updateUser = async (userData: Partial<UserType>) => {
        const result = await userApiService.updateProfile(user!.id, userData)
        await storage.set('user-data', result)
        setUser(result)
        return result
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
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}

export const useUpdateProfile = () => {
    const { user } = useUser()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Partial<UserType>) =>
            userApiService.updateProfile(user!.id, data),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['user'], updatedUser)
        }
    })
}
