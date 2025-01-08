// src/shared/api/user/user-api.service.ts
import { apiClient } from '@shared/config/api-client'
import { UserType } from '@shared/types/user/UserType'

class UserApiService {
  async updateProfile(userId: number, data: Partial<UserType>): Promise<UserType> {
    return await apiClient.patch(`api/v2/user/${userId}/`, data)
  }
}

export const userApiService = new UserApiService()