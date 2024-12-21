// src/shared/api/auth/auth.service.ts
import { apiClient } from '@shared/config/api-client'
import { UserType } from '@shared/types/user/UserType'

interface AuthResponse {
  user: UserType
  tokens: {
    accessToken: string
    refreshToken: string
    expiresAt: number
  }
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData extends LoginData {
  first_name: string
  last_name: string
}

class AuthService {
  async checkEmail(email: string) {
    return apiClient.post<{ exists: boolean }>('/apiV2/auth/check-email/', { email })
  }

  async login(data: LoginData) {
    return apiClient.post<AuthResponse>('/apiV2/auth/login/', data)
  }

  async register(data: RegisterData) {
    return apiClient.post<AuthResponse>('/apiV2/auth/register/', data)
  }

  async checkAuth() {
    return apiClient.get<UserType>('/apiV2/user/checkAuthenticate/')
  }

  async logout() {
    return apiClient.post('/apiV2/auth/logout/')
  }
}

export const authService = new AuthService()