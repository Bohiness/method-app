// src/shared/api/base/api-client.ts
import NetInfo from '@react-native-community/netinfo';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { Platform } from 'react-native';

// Определяем базовый URL в зависимости от платформы
const getDevelopmentApiUrl = () => {
    if (__DEV__) {
        return Platform.select({
            ios: 'http://localhost:8000',
            android: 'http://10.0.2.2:8000',
            default: 'http://localhost:8000',
        });
    }
    return process.env.EXPO_PUBLIC_API_URL || 'https://api.method.do';
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
                        throw new Error('Нет подключения к интернету');
                    }

                    // Получаем и устанавливаем заголовки
                    const headers = await this.getRequestHeaders();
                    config.headers = { ...config.headers, ...headers } as AxiosRequestHeaders;

                    return config;
                } catch (error) {
                    logger.error('ApiClient: Request interceptor error:', error, 'api-client');
                    return Promise.reject(error);
                }
            },
            error => {
                logger.error('ApiClient: Request interceptor error:', error, 'api-client');
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
                            logger.error('ApiClient: Token refresh failed:', refreshError, 'api-client');
                            await tokenService.clearSession();
                            throw refreshError;
                        }
                    }

                    throw error;
                } catch (error) {
                    logger.error('ApiClient: Response interceptor error:', error, 'api-client');
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
            const language = (await storage.get<string>('app-locale')) || 'ru';
            const csrfToken = await storage.get<string>('csrf-token');

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
            logger.error('ApiClient: Error getting headers:', error, 'api-client');
            return headers;
        }
    }

    // GET запрос
    async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        const netInfo = await NetInfo.fetch();

        if (!netInfo.isConnected) {
            throw new Error('Нет подключения к интернету');
        }

        try {
            const response = await this.instance.get<T>(endpoint, config);
            return response.data;
        } catch (error) {
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
        }
    }
}

export const apiClient = new ApiClient();
