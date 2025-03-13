import { authApiService } from '@shared/api/auth/auth-api.service';
import { useUser } from '@shared/context/user-provider';
import { storage } from '@shared/lib/storage/storage.service';
import { validateEmail } from '@shared/lib/utils/validateEmail';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Типы для состояния ошибок
type ErrorState = {
    email?: string;
    password?: string;
    send?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
};

// Ответ от проверки email
interface CheckEmailResponse {
    status: 'register' | 'login';
    name?: string;
    has_expert?: boolean;
}

export const useLoginForm = (nextPage?: string, isExpertPage = false) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { signIn, convertToRegistered } = useUser();
    const returnTo = '/(tabs)';

    // Состояния формы
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [isExpert, setIsExpert] = useState(false);
    const [loginLikeExpert, setLoginLikeExpert] = useState(false);
    const [errors, setErrors] = useState<ErrorState>({});
    const [emailChecked, setEmailChecked] = useState(false);

    // Мутация для проверки email
    const checkEmailMutation = useMutation({
        mutationFn: async (email: string): Promise<CheckEmailResponse> => {
            try {
                const response = await authApiService.checkEmail(email);
                return response as CheckEmailResponse;
            } catch (error) {
                throw error;
            }
        },
    });

    const resetForm = useCallback(() => {
        setPassword('');
        setName('');
        setIsRegister(false);
        setIsExpert(false);
        setLoginLikeExpert(false);
        setErrors({});
        setEmailChecked(false);
    }, []);

    const handleEmailChange = useCallback(
        (value: string) => {
            setEmail(value);
            if (errors.email) {
                setErrors(prev => ({ ...prev, email: '' }));
            }
            resetForm();
        },
        [errors.email, resetForm]
    );

    const handleErrorMessage = useCallback(
        (error: any): string => {
            if (error.response?.data?.message) {
                return error.response.data.message;
            }
            return error.message || t('auth.loginForm.unexpectedError');
        },
        [t]
    );

    const handleCheckEmail = useCallback(async () => {
        if (!validateEmail(email)) {
            setErrors({ email: t('auth.loginForm.invalidEmail') });
            return;
        }

        try {
            const result = await checkEmailMutation.mutateAsync(email);
            if (result.status === 'register') {
                setIsRegister(true);
            } else if (result.status === 'login' && result.name) {
                if (result.has_expert) {
                    setIsExpert(true);
                }
                setName(result.name);
            }
            setEmailChecked(true);
            setErrors({});
        } catch (error) {
            console.error('Check email error:', error);
            setErrors({ send: handleErrorMessage(error) });
            setEmailChecked(false);
        }
    }, [email, t, checkEmailMutation, handleErrorMessage]);

    const handleLogin = useCallback(async () => {
        if (!email) {
            setErrors({ email: t('auth.loginForm.enterEmail') });
            return;
        }
        if (!password) {
            setErrors({ password: t('auth.loginForm.enterPassword') });
            return;
        }

        try {
            await signIn({ email, password });

            // Сохраняем данные для автологина
            await storage.set('last-email', email);

            // Редирект после успешного входа
            router.dismissAll();
            router.push(returnTo);
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ send: handleErrorMessage(error) });
        }
    }, [email, password, signIn, loginLikeExpert, returnTo, router, handleErrorMessage]);

    const handleRegister = useCallback(async () => {
        if (!password) {
            setErrors({ password: t('auth.loginForm.enterPassword') });
            return;
        }

        if (isExpertPage && (!firstName || !lastName)) {
            setErrors({
                firstName: !firstName ? t('auth.loginForm.enterFirstName') : '',
                lastName: !lastName ? t('auth.loginForm.enterLastName') : '',
            });
            return;
        }

        const userData = {
            email,
            password,
            name,
            firstName,
            lastName,
        };

        try {
            await convertToRegistered(userData);
            router.dismissAll();
            router.replace(returnTo);
        } catch (error) {
            console.error('Register error:', error);
            setErrors({ send: handleErrorMessage(error) });
        }
    }, [email, password, name, firstName, lastName, isExpertPage, returnTo, router, handleErrorMessage]);

    const handleSubmit = useCallback(async () => {
        setErrors({});

        if (!emailChecked) {
            await handleCheckEmail();
        } else if (isRegister) {
            await handleRegister();
        } else {
            await handleLogin();
        }
    }, [emailChecked, isRegister, handleCheckEmail, handleRegister, handleLogin]);

    const handleClickShowPassword = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const isPasswordValid = useCallback(() => {
        if (!password) return false;
        return password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password);
    }, [password]);

    const isLoading = checkEmailMutation.isPending;

    const isSuccess = checkEmailMutation.isSuccess;

    const isError = checkEmailMutation.isError;

    const shouldShowExpertFields = isRegister && isExpertPage;

    return {
        email,
        handleEmailChange,
        password,
        setPassword,
        isPasswordValid,
        name,
        isRegister,
        isExpert,
        loginLikeExpert,
        setLoginLikeExpert,
        loading: isLoading,
        success: isSuccess,
        error: isError,
        errors,
        showPassword,
        handleClickShowPassword,
        handleSubmit,
        shouldShowPasswordField: emailChecked,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        isExpertPage,
        shouldShowExpertFields,
        t: (key: string) => t(`auth.loginForm.${key}`),
    };
};
