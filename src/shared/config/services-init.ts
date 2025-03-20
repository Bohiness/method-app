import { authApiService } from '@shared/api/auth/auth-api.service';
import { apiClient } from '@shared/config/api-client';
import { logger } from '@shared/lib/logger/logger.service';

/**
 * Инициализация сервисов и установка зависимостей между ними
 * Этот файл решает проблему циклических зависимостей
 */
export function initializeServices() {
    try {
        // Устанавливаем authApiService в apiClient
        apiClient.setAuthApiService(authApiService);

        logger.debug('Services initialized successfully');
    } catch (error) {
        // Логируем ошибку, но не прерываем выполнение программы
        logger.error(error, 'Services initialization error:');
    }
}
