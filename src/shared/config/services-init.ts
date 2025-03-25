import { authApiService } from '@shared/api/auth/auth-api.service';
import { apiClient } from '@shared/config/api-client';
import { logger } from '@shared/lib/logger/logger.service';
import { subscriptionService } from '@shared/lib/subscription/subscription.service';
import { updateService } from '@shared/lib/update/update.service';

/**
 * Инициализация сервисов и установка зависимостей между ними
 * Этот файл решает проблему циклических зависимостей
 */
export async function initializeServices() {
    try {
        await updateService.initialize();
        logger.debug('Update service initialized successfully');
    } catch (updateError) {
        logger.error(updateError, 'Failed to initialize update service');
    }

    try {
        await subscriptionService.initialize();
        logger.debug('Subscription service initialized successfully');
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
