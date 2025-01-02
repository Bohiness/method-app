// src/shared/lib/settings/settings.service.ts
import { apiClient } from '@shared/config/api-client'
import { storage } from '@shared/lib/storage/storage.service'
import { UserType } from '@shared/types/user/UserType'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'ru' | 'en'
  timezone: string
}

const SETTINGS_STORAGE_KEY = 'app-settings'

export class SettingsService {
  private async getDefaultSettings(): Promise<AppSettings> {
    return {
      theme: 'system',
      language: 'ru',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await storage.get<AppSettings>(SETTINGS_STORAGE_KEY)
      return settings || await this.getDefaultSettings()
    } catch (error) {
      console.error('Failed to get settings:', error)
      return this.getDefaultSettings()
    }
  }

  async updateSettings(newSettings: Partial<AppSettings>, user?: UserType | null): Promise<AppSettings> {
    try {
      // Получаем текущие настройки
      const currentSettings = await this.getSettings()
      const updatedSettings = { ...currentSettings, ...newSettings }

      // Сохраняем локально
      await storage.set(SETTINGS_STORAGE_KEY, updatedSettings)

      // Если пользователь авторизован и меняются язык или таймзона
      if (user?.id && (newSettings.language || newSettings.timezone)) {
        const serverUpdate: Partial<UserType> = {}
        
        if (newSettings.language) {
          serverUpdate.language = newSettings.language
        }
        if (newSettings.timezone) {
          serverUpdate.timezone = newSettings.timezone
        }

        // Отправляем на сервер только если есть что обновлять
        if (Object.keys(serverUpdate).length > 0) {
          await apiClient.patch(`/api/users/${user.id}/`, serverUpdate)
        }
      }

      return updatedSettings
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }
}

export const settingsService = new SettingsService()