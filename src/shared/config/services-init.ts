import { authApiService } from '@shared/api/auth/auth-api.service';
import { apiClient } from '@shared/config/api-client';

/**
 * Инициализация сервисов и установка зависимостей между ними
 * Этот файл решает проблему циклических зависимостей
 */
export function initializeServices() {
    // Устанавливаем authApiService в apiClient
    apiClient.setAuthApiService(authApiService);

    console.debug('Services initialized successfully');
}
