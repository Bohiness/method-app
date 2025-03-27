// src/shared/api/base/api-client.ts
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
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
            withCredentials: true,
        });

        logger.debug('📡 API Client initialized with URL: ' + this.API_URL, 'api-client - constructor');

        this.setupInterceptors();
        this.initCsrfToken();
    }

    setAuthApiService(service: AuthApiService) {
        this.authApiService = service;
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
            const existingToken = await tokenService.getCsrfToken();
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
                                const csrfToken = await storage.get<string>(STORAGE_KEYS.USER.CSRF_TOKEN);
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
        let session: Awaited<ReturnType<typeof tokenService.getSession>> | null = null; // Explicitly allow null

        try {
            // --- Step 1: Get session and handle potential absence gracefully ---
            try {
                session = await tokenService.getSession();
                // If getSession resolves with null/undefined, it's handled below.
            } catch (sessionError: any) {
                // Log only if it's an unexpected error during session retrieval,
                // not just "No session found" if that's how tokenService signals absence.
                // Assuming "No session found" might be thrown, we check the message.
                if (sessionError?.message !== 'No session found') {
                    logger.error(
                        sessionError,
                        'api-client – getRequestHeaders',
                        'ApiClient: Unexpected error retrieving session:'
                    );
                } else {
                    // It's expected that there might be no session, log as debug or warn
                    logger.debug('No active session found.', 'api-client – getRequestHeaders');
                }
                // Continue without a session
            }

            // --- Step 2: Get other necessary info ---
            const language = (await storage.get<string>(STORAGE_KEYS.APP.APP_LOCALE)) || 'en';
            const csrfToken = await storage.get<string>(STORAGE_KEYS.USER.CSRF_TOKEN);

            // --- Step 3: Set base headers ---
            headers['Accept-Language'] = language;
            const origin = this.API_URL;
            headers['Origin'] = origin;
            headers['Referer'] = origin;

            // --- Step 4: Handle CSRF token ---
            if (csrfToken) {
                headers['X-CSRFToken'] = csrfToken;
            } else if (this.authApiService) {
                // If CSRF token is missing, try to fetch it
                try {
                    logger.debug('CSRF token missing, attempting to fetch.', 'api-client – getRequestHeaders');
                    await Promise.race([
                        this.authApiService.getCsrfToken(),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('CSRF token fetch timeout')), this.CSRF_RETRY_TIMEOUT_MS)
                        ),
                    ]);
                    const newCsrfToken = await storage.get<string>(STORAGE_KEYS.USER.CSRF_TOKEN);
                    if (newCsrfToken) {
                        headers['X-CSRFToken'] = newCsrfToken;
                        logger.debug('New CSRF token fetched and set.', 'api-client – getRequestHeaders');
                    } else {
                        logger.warn(
                            'CSRF token fetch attempt did not yield a token.',
                            'api-client – getRequestHeaders'
                        );
                    }
                } catch (error) {
                    logger.error(error, 'api-client – getRequestHeaders', 'Failed to get CSRF token:');
                    // Continue without CSRF token if fetching failed
                }
            } else {
                logger.warn(
                    'CSRF token missing and no authApiService available to fetch it.',
                    'api-client – getRequestHeaders'
                );
            }

            // --- Step 5: Handle Authorization header only if session and access token exist ---
            if (session?.access) {
                try {
                    if ((await tokenService.shouldRefreshToken()) && this.authApiService) {
                        logger.debug(
                            'Access token needs refresh, attempting refresh.',
                            'api-client – getRequestHeaders'
                        );
                        const newTokens = await this.authApiService.refreshTokens();
                        headers['Authorization'] = `Bearer ${newTokens.access}`;
                        logger.debug(
                            'Access token refreshed and Authorization header set.',
                            'api-client – getRequestHeaders'
                        );
                    } else {
                        // Use existing access token
                        headers['Authorization'] = `Bearer ${session.access}`;
                    }
                } catch (tokenError) {
                    logger.error(
                        tokenError,
                        'api-client – getRequestHeaders',
                        'ApiClient: Error handling token refresh or setting Authorization header:'
                    );
                    // Decide how to handle token errors, e.g., clear session?
                    // For now, just log and proceed without Authorization header if refresh failed.
                    delete headers['Authorization']; // Ensure header is not set if refresh fails
                    await tokenService.clearSession(); // Consider clearing session on refresh failure
                }
            } else {
                logger.debug(
                    'No access token found in session, skipping Authorization header.',
                    'api-client – getRequestHeaders'
                );
            }

            return headers;
        } catch (error) {
            // Catch any other unexpected errors during the overall header preparation
            logger.error(error, 'api-client – getRequestHeaders', 'ApiClient: Unexpected error getting headers:');
            // Return headers collected so far, or empty object, or rethrow based on strategy
            return headers; // Return potentially incomplete headers
        }
    }

    // GET запрос
    async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        // Removed internet check here, it's done in the interceptor
        // if (!(await this.checkInternetConnection())) { ... }

        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            // Log the request being made
            logger.debug(`GET request to ${endpoint}`, 'api-client - get');

            const response = await this.instance.get<T>(endpoint, configWithSignal);
            return response.data;
        } catch (error) {
            // Error is already logged by interceptor and handleError
            // logger.error(error, 'api-client – get', 'ApiClient: Error getting data:');
            this.handleError(error); // Ensure error details are processed
            throw error; // Re-throw the error for calling code to handle
        }
    }

    // POST запрос
    async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        // Removed internet check here
        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            // Log the request being made
            logger.debug(`POST request to ${endpoint}`, 'api-client - post');

            const response = await this.instance.post<T>(endpoint, data, configWithSignal);
            return response.data;
        } catch (error) {
            // Error is already logged by interceptor and handleError
            // logger.error(error, 'api-client – post', 'ApiClient: Error posting data:');
            this.handleError(error);
            throw error;
        }
    }

    // PUT запрос
    async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        // Removed internet check here
        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            // Log the request being made
            logger.debug(`PUT request to ${endpoint}`, 'api-client - put');

            const response = await this.instance.put<T>(endpoint, data, configWithSignal);
            return response.data;
        } catch (error) {
            // Error is already logged by interceptor and handleError
            // logger.error(error, 'api-client – put', 'ApiClient: Error putting data:');
            this.handleError(error);
            throw error;
        }
    }

    // PATCH запрос
    async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        // Removed internet check here
        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            // Log the request being made
            logger.debug(`PATCH request to ${endpoint}`, 'api-client - patch');

            const response = await this.instance.patch<T>(endpoint, data, configWithSignal);
            return response.data;
        } catch (error) {
            // Error is already logged by interceptor and handleError
            // logger.error(error, 'api-client – patch', 'ApiClient: Error patching data:');
            this.handleError(error);
            throw error;
        }
    }

    // DELETE запрос
    async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        // Removed internet check here
        try {
            const controller = new AbortController();
            const configWithSignal = { ...config, signal: controller.signal };

            // Log the request being made
            logger.debug(`DELETE request to ${endpoint}`, 'api-client - delete');

            const response = await this.instance.delete<T>(endpoint, configWithSignal);
            return response.data;
        } catch (error) {
            // Error is already logged by interceptor and handleError
            // logger.error(error, 'api-client – delete', 'ApiClient: Error deleting data:');
            this.handleError(error);
            throw error;
        }
    }

    // Обработка ошибок
    private handleError(error: any) {
        if (axios.isAxiosError(error)) {
            // Avoid logging cancellation errors as actual errors
            if (axios.isCancel(error)) {
                logger.warn('Request canceled', 'api-client – handleError', error.message);
                return; // Don't log cancellation as an error
            }

            const axiosError = error as AxiosError<ApiErrorResponse>;
            const errorInfo = {
                message: axiosError.message,
                status: axiosError.response?.status,
                // Avoid logging potentially large response data by default, maybe log only detail/message
                responseData: axiosError.response?.data
                    ? {
                          detail: axiosError.response.data.detail,
                          message: axiosError.response.data.message,
                          code: axiosError.response.data.code,
                      }
                    : undefined,
                code: axiosError.code, // Network error codes like ECONNABORTED
                config: {
                    url: axiosError.config?.url,
                    method: axiosError.config?.method,
                    baseURL: axiosError.config?.baseURL,
                    // Avoid logging sensitive headers like Authorization
                    // headers: axiosError.config?.headers,
                },
            };
            // Log based on status code severity
            if (axiosError.response && axiosError.response.status >= 500) {
                logger.error(errorInfo, 'api-client – handleError', `Server Error (${axiosError.response.status}):`);
            } else if (axiosError.response && axiosError.response.status >= 400) {
                logger.warn(errorInfo, 'api-client – handleError', `Client Error (${axiosError.response.status}):`);
            } else if (axiosError.request) {
                // The request was made but no response was received
                logger.error(errorInfo, 'api-client – handleError', 'Network Error or No Response:');
            } else {
                // Something happened in setting up the request that triggered an Error
                logger.error(errorInfo, 'api-client – handleError', 'Request Setup Error:');
            }
        } else {
            // Handle non-Axios errors
            logger.error(error, 'api-client – handleError', 'ApiClient: Non-axios error occurred:');
        }
    }
}

export const apiClient = new ApiClient();
