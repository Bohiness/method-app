import { apiClient } from '@shared/config/api-client'
import { API_ROUTES } from '@shared/constants/api-routes'
import { storage } from '@shared/lib/storage/storage.service'
import { validateEmail } from '@shared/lib/utils/validateEmail'
import { useEffect, useState } from 'react'

interface UsePasswordResetProps {
    email?: string
    token?: string
    onSuccess?: ({ token }: { token: string }) => void
    onError?: (error: string) => void
}

interface PasswordResetErrors {
    email?: string
    password?: string
    password2?: string
    server?: string
}

export const usePasswordReset = ({ email: initialEmail, token: initialToken, onSuccess, onError }: UsePasswordResetProps = {}) => {
    const [email, setEmail] = useState(initialEmail || '')
    const [token, setToken] = useState(initialToken || '')

    const [resendAllowed, setResendAllowed] = useState(true)
    const [timeLeft, setTimeLeft] = useState(60)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<PasswordResetErrors>({})

    useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail)
        }
    }, [initialEmail])

    useEffect(() => {
        const checkLastSentTime = async () => {
            try {
                const lastSentTime = await storage.get<string>('lastSentTime')
                if (lastSentTime) {
                    const currentTime = Date.now()
                    const elapsedTime = Math.floor((currentTime - parseInt(lastSentTime)) / 1000)
                    if (elapsedTime < 60) {
                        setResendAllowed(false)
                        setTimeLeft(60 - elapsedTime)
                    }
                }
            } catch (error) {
                console.error('Error checking last sent time:', error)
            }
        }

        checkLastSentTime()
    }, [])

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (!resendAllowed) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setResendAllowed(true)
                        return 60
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [resendAllowed])

    const validateForm = (email: string): boolean => {
        const newErrors: PasswordResetErrors = {}

        if (!email) {
            newErrors.email = 'Email is required'
        } else if (!validateEmail(email)) {
            newErrors.email = 'Invalid email format'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validatePasswords = (password: string, password2: string): boolean => {
        const newErrors: PasswordResetErrors = {}

        if (!password || !password2) {
            newErrors.password = 'Password is required'
            newErrors.password2 = 'Password confirmation is required'
        } else if (password !== password2) {
            newErrors.password2 = 'Passwords do not match'
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const sendResetEmail = async (email: string) => {
        if (!validateForm(email)) {
            return
        }

        setLoading(true)
        setErrors({})

        try {
            const response = await apiClient.post<{ message: string }>(
                API_ROUTES.AUTH.FORGOT_PASSWORD,
                { email }
            )

            if (response) {
                await storage.set('lastSentTime', Date.now().toString())
                setResendAllowed(false)
                setTimeLeft(60)
                onSuccess?.()
            }
        } catch (error) {
            console.error('Password reset error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
            setErrors({ server: errorMessage })
            onError?.(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const verifyCode = async (code: string) => {
        setLoading(true)
        try {
            const response = await apiClient.post<{ message: string; token: string }>(
                API_ROUTES.AUTH.CHECK_CODE,
                { email, code }
            )

            if (response?.token) {
                onSuccess?.({ token: response.token })
                return { success: true, token: response.token }
            }
            return { success: false }
        } catch (error) {
            console.error('Code verification error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Invalid code'
            setErrors({ server: errorMessage })
            onError?.(errorMessage)
            return { success: false }
        } finally {
            setLoading(false)
        }
    }

    const resetPassword = async (password: string, password2: string) => {
        if (!validatePasswords(password, password2)) {
            return
        }

        setLoading(true)
        setErrors({})

        try {
            const response = await apiClient.post<{ message: string }>(
                API_ROUTES.AUTH.SET_PASSWORD,
                {
                    email,
                    password,
                    password2,
                    token
                }
            )

            if (response) {
                onSuccess?.({ token })
            }
        } catch (error) {
            console.error('Password reset error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to reset password'
            setErrors({ server: errorMessage })
            onError?.(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setEmail('')
        setErrors({})
        setLoading(false)
        setResendAllowed(true)
        setTimeLeft(60)
    }

    return {
        email,
        setEmail,
        token,
        setToken,
        resendAllowed,
        timeLeft,
        loading,
        errors,
        sendResetEmail,
        verifyCode,
        resetPassword,
        reset
    }
}