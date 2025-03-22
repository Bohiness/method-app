// src/shared/api/base/api-client.ts
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosRequestHeaders,
    InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';

// Расширяем тип конфигурации Axios для поддержки кастомных данных
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _customData?: {
        retryCount?: number;
        [key: string]: any;
    };
}

// Интерфейс для сервиса авторизации
interface AuthApiService {
    getCsrfToken: () => Promise<string | null>;
    refreshTokens: () => Promise<{ access: string; refresh: string }>;
}

// Типы для ошибок API
interface ApiErrorResponse {
    detail?: string;
    message?: string;
    errors?: Record<string, string[]>;
    code?: string;
}

// Определяем базовый URL в зависимости от платформы
const getDevelopmentApiUrl = () => {
    if (__DEV__) {
        const devUrl = Platform.select({
            ios: 'http://localhost:8000',
            android: 'http://10.0.2.2:8000',
            default: 'http://localhost:8000',
        });
        logger.debug(`🚀 Using DEV API URL: ${devUrl}`, 'api-client - getDevelopmentApiUrl');
        return devUrl;
    }
    const prodUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.method.do';
    logger.debug(`🚀 Using PROD API URL: ${prodUrl}`, 'api-client - getDevelopmentApiUrl');
    return prodUrl;
};

const API_URL = getDevelopmentApiUrl();

class ApiClient {
    private instance: AxiosInstance;
    private readonly API_URL: string;
    private authApiService: AuthApiService | null = null; // Типизированный сервис авторизации
    private csrfInitialized: boolean = false;
    private MAX_RETRY_ATTEMPTS = 3;
    private RETRY_DELAY_MS = 1000;
    private CSRF_RETRY_TIMEOUT_MS = 5000;

    constructor() {
        this.API_URL = API_URL;
        this.instance = axios.create({
            baseURL: this.API_URL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            withCredentials: true, // Важно для корректной работы с CSRF
        });

        logger.debug('📡 API Client initialized with URL: ' + this.API_URL, 'api-client - constructor');

        this.setupInterceptors();
        this.initCsrfToken();
    }

    // Метод для установки authApiService после его инициализации
    setAuthApiService(service: AuthApiService) {
        this.authApiService = service;
        // Повторно инициализируем CSRF токен после установки authApiService
        if (!this.csrfInitialized) {
            this.initCsrfToken();
        }
    }

    // Проверка соединения с интернетом
    private async checkInternetConnection(): Promise<boolean> {
        try {
            const netInfo = await NetInfo.fetch();
            return Boolean(netInfo.isConnected);
        } catch (error) {
            logger.error(error, 'api-client - checkInternetConnection', 'Failed to check internet connection');
            return false;
        }
    }

    // Инициализация CSRF токена
    private async initCsrfToken() {
        try {
            const existingToken = await storage.get<string>(STORAGE_KEYS.CSRF_TOKEN);
            if (!existingToken && this.authApiService) {
                await this.authApiService.getCsrfToken();
                this.csrfInitialized = true;
                logger.debug('CSRF token initialized', 'api-client - initCsrfToken');
            } else if (existingToken) {
                this.csrfInitialized = true;
                logger.debug('Using existing CSRF token', 'api-client - initCsrfToken');
            }
        } catch (error) {
            logger.error(error, 'api-client - initCsrfToken', 'Failed to initialize CSRF token:');
        }
    }

    private setupInterceptors() {
        // Интерцептор запросов
        this.instance.interceptors.request.use(
            async config => {
                try {
                    // Проверяем подключение к интернету
                    const isConnected = await this.checkInternetConnection();
                    if (!isConnected) {
                        throw new Error('No internet connection');
                    }

                    // Получаем и устанавливаем заголовки
                    const headers = await this.getRequestHeaders();
                    config.headers = { ...config.headers, ...headers } as AxiosRequestHeaders;

                    return config;
                } catch (error) {
                    logger.error(error, 'api-client – request interceptor', 'ApiClient: Request interceptor error:');
                    return Promise.reject(error);
                }
            },
            error => {
                logger.error(error, 'api-client – request interceptor', 'ApiClient: Request interceptor error:');
                return Promise.reject(error);
            }
        );

        // Интерцептор ответов
        this.instance.interceptors.response.use(
            response => response,
            async (error: AxiosError<ApiErrorResponse>) => {
                try {
                    const originalRequest = error.config as CustomAxiosRequestConfig;
                    if (!originalRequest) {
                        throw error;
                    }

                    // Проверяем, можно ли повторить запрос
                    const customData = originalRequest._customData || {};
                    const retryCount = customData.retryCount || 0;
                    const isIdempotentMethod = ['get', 'head', 'options', 'put', 'delete'].includes(
                        (originalRequest.method || '').toLowerCase()
                    );

                    // Обрабатываем 401 ошибку
                    if (
                        error.response?.status === 401 &&
                        originalRequest.url !== 'api/token/refresh/' &&
                        this.authApiService
                    ) {
                        try {
                            const tokens = await this.authApiService.refreshTokens();

                            // Обновляем заголовок Authorization
                            originalRequest.headers['Authorization'] = `Bearer ${tokens.access}`;

                            // Повторяем оригинальный запрос
                            return this.instance(originalRequest);
                        } catch (refreshError) {
                            logger.error(
                                refreshError,
                                'api-client – token refresh',
                                'ApiClient: Token refresh failed:'
                            );
                            await tokenService.clearSession();
                            throw refreshError;
                        }
                    }

                    // Расширенная обработка CSRF ошибок
                    if (error.response?.status === 403 || error.response?.status === 400) {
                        const errorData = error.response.data;
                        const errorDetail = errorData?.detail || '';
                        const errorMessage = typeof errorData === 'string' ? errorData : '';

                        // Проверяем все возможные CSRF ошибки
                        const isCsrfError =
                            errorDetail.includes('CSRF') ||
                            errorDetail.includes('Referer checking failed') ||
                            errorDetail.includes('Origin checking failed') ||
                            errorDetail.includes('CSRF token') ||
                            errorDetail.includes('CSRF cookie not set') ||
                            errorMessage.includes('CSRF') ||
                            errorMessage.includes('csrf');

                        if (isCsrfError && this.authApiService) {
                            logger.warn(
                                'CSRF error detected, refreshing CSRF token',
                                'api-client – response interceptor'
                            );
                            try {
                                await Promise.race([
                                    this.authApiService.getCsrfToken(),
                                    new Promise((_, reject) =>
                                        setTimeout(
                                            () => reject(new Error('CSRF token refresh timeout')),
                                            this.CSRF_RETRY_TIMEOUT_MS
                                        )
                                    ),
                                ]);

                                // Обновляем CSRF токен в заголовках запроса
                                const csrfToken = await storage.get<string>(STORAGE_KEYS.CSRF_TOKEN);
                                if (csrfToken) {
                                    originalRequest.headers['X-CSRFToken'] = csrfToken;
                                }

                                return this.instance(originalRequest);
                            } catch (csrfError) {
                                logger.error(
                                    csrfError,
                                    'api-client – csrf refresh',
                                    'ApiClient: CSRF token refresh failed:'
                                );
                                throw csrfError;
                            }
                        }
                    }

                    // Автоматический повтор запросов при сетевых ошибках или ошибках сервера
                    if (
                        (error.code === 'ECONNABORTED' ||
                            error.code === 'ETIMEDOUT' ||
                            (error.response && error.response.status >= 500)) &&
                        retryCount < this.MAX_RETRY_ATTEMPTS &&
                        isIdempotentMethod
                    ) {
                        // Сохраняем счетчик попыток в кастомном поле
                        originalRequest._customData = {
                            ...customData,
                            retryCount: retryCount + 1,
                        };

                        // Задержка перед повторной попыткой
                        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS * (retryCount + 1)));

                        logger.debug(
                            `Retrying request attempt ${retryCount + 1}/${this.MAX_RETRY_ATTEMPTS}`,
                            'api-client - response interceptor'
                        );

                        return this.instance(originalRequest);
                    }

                    throw error;
                } catch (error) {
                    logger.error(error, 'api-client – response interceptor', 'ApiClient: Response interceptor error:');
                    return Promise.reject(error);
                }
            }
        );
    }

    private async getRequestHeaders(): Promise<Record<string, string>> {
        const headers: Record<string, string> = {};

        try {
            // Получаем текущую сессию
            const session = await tokenService.getSession();
            const language = (await storage.get<string>(STORAGE_KEYS.APP_LOCALE)) || 'en';
            const csrfToken = await storage.get<string>(STORAGE_KEYS.CSRF_TOKEN);

            // Устанавливаем базовые заголовки
            headers['Accept-Language'] = language;

            // Добавляем Origin и Referer для CSRF проверок
            const origin = this.API_URL;
            headers['Origin'] = origin;
            headers['Referer'] = origin;

            if (csrfToken) {
                headers['X-CSRFToken'] = csrfToken;
            } else if (this.authApiService) {
                // Если CSRF токена нет, пытаемся получить его
                try {
                    await Promise.race([
                        this.authApiService.getCsrfToken(),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('CSRF token fetch timeout')), this.CSRF_RETRY_TIMEOUT_MS)
                        ),
                    ]);

                    const newCsrfToken = await storage.get<string>(STORAGE_KEYS.CSRF_TOKEN);
                    if (newCsrfToken) {
                        headers['X-CSRFToken'] = newCsrfToken;
                    }
                } catch (error) {
                    logger.error(error, 'api-client – getRequestHeaders', 'Failed to get CSRF token:');
                }
            }

            // Если есть сессия, проверяем и обновляем токен при необходимости
            if (session?.access) {
                if ((await tokenService.shouldRefreshToken()) && this.authApiService) {
                    const newTokens = await this.authApiService.refreshTokens();
                    headers['Authorization'] = `Bearer ${newTokens.access}`;
                } else if (session.access) {
                    headers['Authorization'] = `Bearer ${session.access}`;
                }
            }

            return headers;
        } catch (error) {
            logger.error(error, 'api-client – getRequestHeaders', 'ApiClient: Error getting headers:');
            return headers;
        }
    }

    // GET запрос
    async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        if (!(await this.checkInternetConnection())) {
            logger.error('No internet connection', 'api-client – get', 'ApiClient: Error getting data:');
            throw new Error('No internet connection');
        }

        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            const response = await this.instance.get<T>(endpoint, configWithSignal);
            return response.data;
        } catch (error) {
            logger.error(error, 'api-client – get', 'ApiClient: Error getting data:');
            this.handleError(error);
            throw error;
        }
    }

    // POST запрос
    async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!(await this.checkInternetConnection())) {
            logger.error('No internet connection', 'api-client – post', 'ApiClient: Error posting data:');
            throw new Error('No internet connection');
        }

        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            const response = await this.instance.post<T>(endpoint, data, configWithSignal);
            return response.data;
        } catch (error) {
            logger.error(error, 'api-client – post', 'ApiClient: Error posting data:');
            this.handleError(error);
            throw error;
        }
    }

    // PUT запрос
    async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!(await this.checkInternetConnection())) {
            logger.error('No internet connection', 'api-client – put', 'ApiClient: Error putting data:');
            throw new Error('No internet connection');
        }

        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            const response = await this.instance.put<T>(endpoint, data, configWithSignal);
            return response.data;
        } catch (error) {
            logger.error(error, 'api-client – put', 'ApiClient: Error putting data:');
            this.handleError(error);
            throw error;
        }
    }

    // PATCH запрос
    async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!(await this.checkInternetConnection())) {
            logger.error('No internet connection', 'api-client – patch', 'ApiClient: Error patching data:');
            throw new Error('No internet connection');
        }

        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            const response = await this.instance.patch<T>(endpoint, data, configWithSignal);
            return response.data;
        } catch (error) {
            logger.error(error, 'api-client – patch', 'ApiClient: Error patching data:');
            this.handleError(error);
            throw error;
        }
    }

    // DELETE запрос
    async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        if (!(await this.checkInternetConnection())) {
            logger.error('No internet connection', 'api-client – delete', 'ApiClient: Error deleting data:');
            throw new Error('No internet connection');
        }

        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            const response = await this.instance.delete<T>(endpoint, configWithSignal);
            return response.data;
        } catch (error) {
            logger.error(error, 'api-client – delete', 'ApiClient: Error deleting data:');
            this.handleError(error);
            throw error;
        }
    }

    // Обработка ошибок
    private handleError(error: any) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            const errorInfo = {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                detail: axiosError.response?.data?.detail,
                code: axiosError.code,
                headers: axiosError.response?.headers,
                config: {
                    url: axiosError.config?.url,
                    method: axiosError.config?.method,
                    baseURL: axiosError.config?.baseURL,
                    headers: axiosError.config?.headers,
                },
            };
            logger.error(errorInfo, 'api-client – handleError', 'ApiClient: Error handling error:');
        } else {
            logger.error(error, 'api-client – handleError', 'ApiClient: Non-axios error:');
        }
    }
}

export const apiClient = new ApiClient();
