// src/shared/api/base/api-client.ts
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
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

class ApiClient {
    private instance: AxiosInstance;
    private readonly API_URL: string;
    private authApiService: any = null; // Будет установлен позже

    constructor() {
        this.API_URL = API_URL;
        this.instance = axios.create({
            baseURL: this.API_URL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        console.log('📡 API Client initialized with URL:', this.API_URL);

        this.setupInterceptors();
    }

    // Метод для установки authApiService после его инициализации
    setAuthApiService(service: any) {
        this.authApiService = service;
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

                    // Универсальная проверка на CSRF ошибки
                    if (error.response?.status === 403) {
                        const errorDetail = (error?.response?.data as any)?.detail || '';

                        // Проверяем все возможные CSRF ошибки
                        const isCsrfError =
                            errorDetail.includes('CSRF') ||
                            errorDetail.includes('Referer checking failed') ||
                            errorDetail.includes('Origin checking failed') ||
                            errorDetail.includes('CSRF token') ||
                            errorDetail.includes('CSRF cookie not set');

                        if (isCsrfError && this.authApiService) {
                            logger.info(
                                'CSRF error detected, refreshing CSRF token',
                                'api-client – response interceptor'
                            );
                            await this.authApiService.getCsrfToken();
                            return this.instance(originalRequest);
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

            if (csrfToken) {
                headers['X-CSRFToken'] = csrfToken;
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
