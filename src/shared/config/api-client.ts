// src/shared/api/base/api-client.ts
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
import { getCsrfToken } from '@shared/lib/getCsrfToken';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { Platform } from 'react-native';

// Определяем базовый URL в зависимости от платформы
const getDevelopmentApiUrl = () => {
    if (__DEV__) {
        const devUrl = Platform.select({
            ios: 'http://localhost:8000',
            android: 'http://10.0.2.2:8000',
            default: 'http://localhost:8000',
        });
        console.log('🚀 Using DEV API URL:', devUrl);
        return devUrl;
    }
    const prodUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.method.do';
    console.log('🚀 Using PROD API URL:', prodUrl);
    return prodUrl;
};

const API_URL = getDevelopmentApiUrl();

// Функция для обновления токенов авторизации
async function refreshAuthTokens() {
    try {
        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
            refresh: (await tokenService.getSession())?.refresh,
        });

        if (response.data?.access) {
            await tokenService.updateAccessToken(response.data.access);
            return response.data;
        }
        throw new Error('Invalid token refresh response');
    } catch (error) {
        logger.error(error, 'api-client - refreshAuthTokens', 'Failed to refresh authorization tokens:');
        await tokenService.clearSession();
        throw error;
    }
}

class ApiClient {
    private instance: AxiosInstance;
    private readonly API_URL: string;
    private csrfInitialized: boolean = false;

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

        console.log('📡 API Client initialized with URL:', this.API_URL);

        this.setupInterceptors();
        this.initCsrfToken();
    }

    // Инициализация CSRF токена
    private async initCsrfToken() {
        try {
            const existingToken = await storage.get<string>(STORAGE_KEYS.CSRF_TOKEN);
            if (!existingToken) {
                await getCsrfToken();
                this.csrfInitialized = true;
                logger.debug('CSRF token initialized', 'api-client - initCsrfToken');
            } else {
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
                    const netInfo = await NetInfo.fetch();
                    if (!netInfo.isConnected) {
                        logger.error(
                            'No internet connection',
                            'api-client – request interceptor',
                            'ApiClient: Request interceptor error:'
                        );
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
            async (error: AxiosError) => {
                try {
                    const originalRequest = error.config;
                    if (!originalRequest) {
                        throw error;
                    }

                    // Обрабатываем 401 ошибку - обновляем токен и повторяем запрос
                    if (error.response?.status === 401 && originalRequest.url !== 'api/token/refresh/') {
                        try {
                            const tokens = await refreshAuthTokens();

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
                        const errorDetail = (error?.response?.data as any)?.detail || '';
                        const errorMessage = typeof error?.response?.data === 'string' ? error.response.data : '';

                        // Проверяем все возможные CSRF ошибки
                        const isCsrfError =
                            errorDetail.includes('CSRF') ||
                            errorDetail.includes('Referer checking failed') ||
                            errorDetail.includes('Origin checking failed') ||
                            errorDetail.includes('CSRF token') ||
                            errorDetail.includes('CSRF cookie not set') ||
                            errorMessage.includes('CSRF') ||
                            errorMessage.includes('csrf');

                        if (isCsrfError) {
                            logger.warn(
                                'CSRF error detected, refreshing CSRF token',
                                'api-client – response interceptor'
                            );
                            try {
                                const csrfToken = await getCsrfToken();

                                // Обновляем CSRF токен в заголовках запроса
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

            // Добавляем CSRF токен, если он есть или получаем новый
            if (csrfToken) {
                headers['X-CSRFToken'] = csrfToken;
            } else {
                try {
                    const newCsrfToken = await getCsrfToken();
                    if (newCsrfToken) {
                        headers['X-CSRFToken'] = newCsrfToken;
                    }
                } catch (error) {
                    logger.error(error, 'api-client – getRequestHeaders', 'Failed to get CSRF token:');
                }
            }

            // Если есть сессия, проверяем и обновляем токен при необходимости
            if (session?.access) {
                if (await tokenService.shouldRefreshToken()) {
                    try {
                        const newTokens = await refreshAuthTokens();
                        headers['Authorization'] = `Bearer ${newTokens.access}`;
                    } catch (error) {
                        logger.error(error, 'api-client – getRequestHeaders', 'Failed to refresh auth tokens:');
                        if (session.access) {
                            headers['Authorization'] = `Bearer ${session.access}`;
                        }
                    }
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
        const netInfo = await NetInfo.fetch();

        if (!netInfo.isConnected) {
            logger.error('No internet connection', 'api-client – get', 'ApiClient: Error getting data:');
            throw new Error('No internet connection');
        }

        try {
            const response = await this.instance.get<T>(endpoint, config);
            return response.data;
        } catch (error) {
            logger.error(error, 'api-client – get', 'ApiClient: Error getting data:');
            this.handleError(error);
            throw error;
        }
    }

    // POST запрос
    async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.post<T>(endpoint, data, config);
            return response.data;
        } catch (error) {
            logger.error(error, 'api-client – post', 'ApiClient: Error posting data:');
            this.handleError(error);
            throw error;
        }
    }

    // PUT запрос
    async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.put<T>(endpoint, data, config);
            return response.data;
        } catch (error) {
            logger.error(error, 'api-client – put', 'ApiClient: Error putting data:');
            this.handleError(error);
            throw error;
        }
    }

    // PATCH запрос
    async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.patch<T>(endpoint, data, config);
            return response.data;
        } catch (error) {
            logger.error(error, 'api-client – patch', 'ApiClient: Error patching data:');
            this.handleError(error);
            throw error;
        }
    }

    // DELETE запрос
    async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.delete<T>(endpoint, config);
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
            const errorInfo = {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                    headers: error.config?.headers,
                },
            };
            logger.error(errorInfo, 'api-client – handleError', 'ApiClient: Error handling error:');
        }
    }
}

export const apiClient = new ApiClient();
