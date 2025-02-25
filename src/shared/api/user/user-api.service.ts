// src/shared/api/user/user-api.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/api-routes';
import { UserType } from '@shared/types/user/UserType';

class UserApiService {
    async updateProfile(userId: number, data: Partial<UserType>): Promise<UserType> {
        return await apiClient.patch(`${API_ROUTES.USER.update(userId)}`, data);
    }
}

export const userApiService = new UserApiService();
