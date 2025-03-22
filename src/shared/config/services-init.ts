import { authApiService } from '@shared/api/auth/auth-api.service';
import { apiClient } from '@shared/config/api-client';
import { logger } from '@shared/lib/logger/logger.service';
import { subscriptionService } from '@shared/lib/subscription/subscription.service';

/**
 * Инициализация сервисов и установка зависимостей между ними
 * Этот файл решает проблему циклических зависимостей
 */
export function initializeServices() {
    try {
        subscriptionService.initialize();
    } catch (subscriptionError) {
        logger.error(subscriptionError, 'Failed to initialize subscription service');
    }

    try {
        apiClient.setAuthApiService(authApiService);
    } catch (authError) {
        logger.error(authError, 'Failed to set auth service');
    }

    logger.debug('Services initialized successfully');
}
