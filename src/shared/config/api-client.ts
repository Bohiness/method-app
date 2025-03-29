// src/shared/api/base/api-client.ts
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { csrfService } from '@shared/lib/user/token/csrf.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosRequestHeaders,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';

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

// Расширяем тип конфига Axios для поддержки кастомных данных
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
    _isRetryAfterRefresh?: boolean;
}

// --- ИЗМЕНЕНО: Список эндпоинтов, для которых НЕ НУЖЕН заголовок Authorization ---
const ENDPOINTS_WITHOUT_AUTH_HEADER = [
    API_ROUTES.AUTH.LOGIN,
    API_ROUTES.AUTH.REGISTER,
    API_ROUTES.AUTH.TOKENS.REFRESH,
    API_ROUTES.AUTH.TOKENS.CSRF_TOKEN,
    API_ROUTES.AUTH.CHECK_EMAIL,
    // Добавь сюда другие публичные эндпоинты, если нужно
];
// --- КОНЕЦ ИЗМЕНЕНИЯ ---

class ApiClient {
    private instance: AxiosInstance;
    private readonly API_URL: string;
    private isRefreshingToken: boolean = false;

    constructor() {
        this.API_URL = API_URL;
        this.instance = axios.create({
            baseURL: this.API_URL,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        logger.debug('📡 Simplified API Client initialized with URL: ' + this.API_URL, 'api-client - constructor');

        this.setupInterceptors();
    }

    // --- ИЗМЕНЕНО: Переписана логика добавления заголовков ---
    private async getRequestHeaders(requestUrl?: string): Promise<Record<string, string>> {
        const headers: Record<string, string> = {};

        // 1. Всегда добавляем язык
        try {
            const language = (await storage.get<string>(STORAGE_KEYS.APP.APP_LOCALE)) || 'en';
            headers['Accept-Language'] = language;
        } catch (langError) {
            logger.warn(langError, 'api-client – getRequestHeaders', 'Failed to get language preference');
            headers['Accept-Language'] = 'en';
        }

        // 2. Добавляем Authorization, если это НЕ один из эндпоинтов без авторизации
        const skipAuthHeader = requestUrl && ENDPOINTS_WITHOUT_AUTH_HEADER.includes(requestUrl as any);
        if (!skipAuthHeader) {
            try {
                const session = await tokenService.getTokensFromStorage();
                if (session?.access) {
                    headers['Authorization'] = `Bearer ${session.access}`;
                    logger.debug('Authorization header added.', 'api-client – getRequestHeaders');
                } else {
                    logger.debug(
                        'No access token found for non-auth endpoint, skipping Authorization header.',
                        'api-client – getRequestHeaders'
                    );
                }
            } catch (tokenError) {
                logger.error(tokenError, 'api-client – getRequestHeaders', 'Error getting access token for header');
            }
        } else {
            logger.debug(`Skipping Authorization header for endpoint: ${requestUrl}`, 'api-client – getRequestHeaders');
        }

        // 3. Добавляем CSRF токен, если это НЕ запрос на получение самого CSRF токена
        const isCsrfFetchRequest = requestUrl === API_ROUTES.AUTH.TOKENS.CSRF_TOKEN;
        if (!isCsrfFetchRequest) {
            try {
                const csrfToken = await csrfService.getCsrfTokenFromStorage();
                if (csrfToken) {
                    headers['X-CSRFToken'] = csrfToken;
                    logger.debug('CSRF token added.', 'api-client – getRequestHeaders');
                } else {
                    logger.debug(
                        'No CSRF token found in storage, skipping CSRF header for non-CSRF-fetch request.',
                        'api-client – getRequestHeaders'
                    );
                }
            } catch (csrfError) {
                logger.error(csrfError, 'api-client – getRequestHeaders', 'Error getting CSRF token for header');
            }
        } else {
            logger.debug('Skipping CSRF header for CSRF fetch request.', 'api-client – getRequestHeaders');
        }

        return headers;
    }
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

    private setupInterceptors() {
        // Интерцептор запросов (передает URL в getRequestHeaders) - без изменений в остальном
        this.instance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                try {
                    const headers = await this.getRequestHeaders(config.url); // Передаем URL
                    config.headers = { ...headers, ...config.headers } as AxiosRequestHeaders;
                    logger.debug(
                        { url: config.url, method: config.method, headers: config.headers },
                        'ApiClient: Request Sent',
                        'api-client - request interceptor'
                    );
                    return config;
                } catch (error) {
                    logger.error(error, 'api-client – request interceptor', 'ApiClient: Request preparation error:');
                    return Promise.reject(error);
                }
            },
            error => {
                logger.error(
                    error,
                    'api-client – request interceptor',
                    'ApiClient: Request interceptor error (before send):'
                );
                return Promise.reject(error);
            }
        );

        // Интерцептор ответов (обработка 403 и логирование ошибок - без изменений)
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                logger.debug(
                    {
                        status: response.status,
                        url: response.config.url,
                    },
                    'ApiClient: Response Received',
                    'api-client - response interceptor'
                );
                return response;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as CustomInternalAxiosRequestConfig | undefined;

                if (
                    error.response?.status === 403 &&
                    originalRequest &&
                    !originalRequest._isRetryAfterRefresh &&
                    !this.isRefreshingToken
                ) {
                    logger.warn(
                        `403 Forbidden detected for ${originalRequest.url}. Attempting token refresh.`,
                        'api-client – response interceptor'
                    );
                    this.isRefreshingToken = true;

                    try {
                        const newAccessToken = await tokenService.getNewAccessToken();
                        logger.debug('Access token refresh successful after 403.', 'api-client - response interceptor');
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        const latestCsrfToken = await csrfService.getCsrfTokenFromServerAndSaveToStorage();
                        if (latestCsrfToken) {
                            originalRequest.headers['X-CSRFToken'] = latestCsrfToken;
                            logger.debug(
                                'Fetched and updated CSRF token in retry request header.',
                                'api-client - response interceptor'
                            );
                        } else {
                            delete originalRequest.headers['X-CSRFToken'];
                            logger.warn(
                                'Could not get new CSRF token after refresh. Removing header for retry.',
                                'api-client - response interceptor'
                            );
                        }

                        originalRequest._isRetryAfterRefresh = true;
                        this.isRefreshingToken = false;
                        logger.debug(
                            'Retrying original request after token refresh.',
                            'api-client – response interceptor'
                        );
                        return this.instance(originalRequest);
                    } catch (refreshError: any) {
                        this.isRefreshingToken = false;
                        logger.error(
                            refreshError,
                            'api-client – token refresh',
                            'ApiClient: Token refresh failed after 403.'
                        );
                        return Promise.reject(error);
                    }
                } else if (error.response?.status === 403 && originalRequest?._isRetryAfterRefresh) {
                    logger.error(
                        `403 Forbidden persisted even after token refresh for ${originalRequest.url}. Aborting.`,
                        'api-client – response interceptor'
                    );
                } else if (error.response?.status === 403 && this.isRefreshingToken) {
                    logger.warn(
                        `403 Forbidden detected for ${originalRequest?.url}, but token refresh is already in progress. Request will fail.`,
                        'api-client – response interceptor'
                    );
                }

                // Логирование остальных ошибок (как было)
                if (error.response && error.response.status !== 403) {
                    logger.warn(
                        {
                            status: error.response.status,
                            url: error.config?.url,
                            method: error.config?.method,
                            errorData: error.response.data,
                        },
                        `ApiClient: Response Error (${error.response.status})`,
                        'api-client - response interceptor error'
                    );
                    if (error.response.status === 401) {
                        logger.error(
                            'ApiClient: Authentication Error (401). Token may need refresh.',
                            'api-client - response interceptor error'
                        );
                    }
                } else if (error.request) {
                    logger.error(
                        {
                            message: error.message,
                            code: error.code,
                            url: error.config?.url,
                            method: error.config?.method,
                        },
                        'ApiClient: Network Error or No Response',
                        'api-client - response interceptor error'
                    );
                } else if (!error.response) {
                    logger.error(
                        error,
                        'ApiClient: Request Setup Error or other client error',
                        'api-client - response interceptor error'
                    );
                }

                return Promise.reject(error);
            }
        );
    }

    // Методы GET, POST, PUT, PATCH, DELETE (без изменений)
    // ...
    async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.get<T>(endpoint, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.post<T>(endpoint, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.put<T>(endpoint, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.patch<T>(endpoint, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.delete<T>(endpoint, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export const apiClient = new ApiClient();
