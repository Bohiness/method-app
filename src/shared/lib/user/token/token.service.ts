// src/shared/lib/user/token/token.service.ts
import { apiClient } from '@shared/config/api-client'
import { storage } from '@shared/lib/storage/storage.service'
import { AuthTokensType } from '@shared/types/user/AuthTokensType'

interface ServerResponse {
  user: any;
  tokens: AuthTokensType
}

class TokenService {
  private readonly SESSION_KEY = 'user-session';

  /**
   * Получение текущей сессии
   */
  async getSession(): Promise<AuthTokensType | null> {
    try {
      console.debug('TokenService: Getting session...')
      const session = await storage.get<AuthTokensType>(this.SESSION_KEY, true)
      
      if (!this.isValidSession(session)) {
        console.debug('TokenService: No session found')
        return null
      }

      return session
    } catch (error) {
      console.error('TokenService: Error getting session:', error)
      return null
    }
  }

  /**
   * Установка новой сессии
   */
  async setSession(newTokens: AuthTokensType): Promise<void> {
    try {
      console.debug('TokenService: Setting new session...')

      const tokens: AuthTokensType = {
        access: newTokens.access,
        refresh: newTokens.refresh,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 * 30 // 30 дней
      }

      if (!tokens.access || !tokens.refresh) {
        console.error('TokenService: Invalid token data', tokens)
        throw new Error('Invalid token data')
      }

      await storage.set(this.SESSION_KEY, tokens, true)
      console.debug('TokenService: Session set successfully')
    } catch (error) {
      console.error('TokenService: Error setting session:', error)
      throw error
    }
  }

  /**
   * Проверка необходимости обновления токена
   */
  async shouldRefreshToken(): Promise<boolean> {
    try {
      const session = await this.getSession()
      if (!session) return true

      // Добавляем 1 минуту буфера
      const bufferTime = 60 * 1000
      return !session.access || (session.expiresAt && Date.now() + bufferTime >= session.expiresAt)
    } catch (error) {
      console.error('TokenService: Error checking refresh:', error)
      return true
    }
  }

  /**
   * Обновление токенов
   */
  async refreshTokens(): Promise<AuthTokensType> {
    try {
      console.debug('TokenService: Starting token refresh...')
      const session = await this.getSession()
      
      if (!session?.refresh) {
        console.error('TokenService: No refresh token available for refresh')
        throw new Error('No refresh token available')
      }

      const response = await apiClient.post<{access: string}>('/api/token/refresh/', {
        refresh: session.refresh
      })

      const tokens: AuthTokensType = {
        access: response.access,
        refresh: session.refresh,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 * 30 // 30 дней
      }

      await this.setSession({ 
        access: tokens.access, 
        refresh: tokens.refresh 
      })
      
      return tokens
    } catch (error) {
      console.error('TokenService: Error refreshing tokens:', error)
      await this.clearSession()
      throw error
    }
  }


  /**
   * Очистка сессии
   */
  async clearSession(): Promise<void> {
    try {
      console.debug('TokenService: Clearing session...')
      await storage.remove(this.SESSION_KEY)
      console.debug('TokenService: Session cleared successfully')
    } catch (error) {
      console.error('TokenService: Error clearing session:', error)
      throw error
    }
  }

  /**
   * Проверка валидности сессии
   */
  private isValidSession(session: AuthTokensType | null): boolean {
    if (!session?.access || !session?.refresh) return false
    
    // Проверяем срок действия, если он установлен
    if (session.expiresAt && Date.now() >= session.expiresAt) {
      return false
    }

    return true
  }
}

export const tokenService = new TokenService();