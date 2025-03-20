// src/shared/api/user/user-api.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/api-routes';
import { SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import { UserType } from '@shared/types/user/UserType';

class UserApiService {
    async updateProfile(userId: number, data: Partial<UserType>): Promise<UserType> {
        return await apiClient.patch(`${API_ROUTES.USER.update(userId)}`, data);
    }

    /**
     * Синхронизирует данные о подписке с сервером
     */
    async syncSubscription(data: {
        isPremium: boolean;
        isPremiumAI: boolean;
        tier: SubscriptionTier;
        expirationDate?: string;
        productId?: string;
    }): Promise<void> {
        await apiClient.put(API_ROUTES.USER.SUBSCRIPTION, data);
    }

    /**
     * Проверяет валидность подписки на сервере
     */
    async verifySubscription(): Promise<{ isValid: boolean }> {
        return await apiClient.get(API_ROUTES.USER.VERIFY_SUBSCRIPTION);
    }
}

export const userApiService = new UserApiService();
