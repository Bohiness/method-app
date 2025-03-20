import { logger } from '@shared/lib/logger/logger.service';
import { SubscriptionErrorInfo } from './useSubscription';

/**
 * Обрабатывает ошибки подписки
 * @param err - Ошибка
 * @param context - Контекст
 * @param setError - Функция установки ошибки
 * @param t - Функция перевода
 * @returns null
 */
// Централизованная обработка ошибок
export const handleSubscriptionError = (
    err: any,
    context: string,
    setError: (error: SubscriptionErrorInfo | null) => void,
    t: (key: string) => string
): null => {
    logger.error(err, `useSubscription – ${context}`, `Failed in ${context}:`);

    let errorInfo: SubscriptionErrorInfo;

    if (err && typeof err === 'object') {
        // Проверяем, является ли ошибка ошибкой RevenueCat
        if ('userCancelled' in err) {
            // Это ошибка RevenueCat
            if (err.userCancelled) {
                errorInfo = {
                    type: 'purchase_cancelled_by_user',
                    message: 'Покупка отменена пользователем',
                    originalError: err,
                };
                // Для отмены пользователем не показываем ошибку
                setError(null);
                return null;
            }

            // Проверяем тип ошибки по кодам RevenueCat
            const errorCode = err.code || '';

            if (typeof errorCode === 'string') {
                if (errorCode.includes('NETWORK')) {
                    errorInfo = {
                        type: 'network_error',
                        message: t('subscription.error.network_error'),
                        originalError: err,
                    };
                } else if (errorCode.includes('PRODUCT_ALREADY_PURCHASED')) {
                    errorInfo = {
                        type: 'already_purchased',
                        message: t('subscription.error.already_purchased'),
                        originalError: err,
                    };
                } else if (errorCode.includes('RECEIPT_INVALID')) {
                    errorInfo = {
                        type: 'receipt_invalid',
                        message: t('subscription.error.receipt_invalid'),
                        originalError: err,
                    };
                } else {
                    errorInfo = {
                        type: 'unknown_error',
                        message: t('subscription.error.unknown_error'),
                        originalError: err,
                    };
                }
            } else {
                errorInfo = {
                    type: 'unknown_error',
                    message: t('subscription.error.unknown_error'),
                    originalError: err,
                };
            }
        } else if (err instanceof Error) {
            // Обычная ошибка JavaScript
            errorInfo = {
                type: 'unknown_error',
                message: t('subscription.error.unknown_error'),
                originalError: err,
            };
        } else {
            errorInfo = {
                type: 'unknown_error',
                message: t('subscription.error.unknown_error'),
                originalError: err,
            };
        }
    } else {
        errorInfo = {
            type: 'unknown_error',
            message: t('subscription.error.unknown_error'),
            originalError: err,
        };
    }

    setError(errorInfo);
    return null;
};
