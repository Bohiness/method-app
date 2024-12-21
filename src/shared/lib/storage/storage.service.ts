// src/shared/lib/storage/storage.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StorageKeysType } from '@shared/types/user/StorageKeysType'
import { decrypt, encrypt } from './crypto.service'

export class StorageService {
  private readonly prefix: string = '@method-app:';

  // Общие методы для работы с хранилищем
  async set<T>(key: string, value: T, encrypt: boolean = false): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key);
      const valueToStore = JSON.stringify(value);
      const finalValue = encrypt ? await this.encryptValue(valueToStore) : valueToStore;
      await AsyncStorage.setItem(storageKey, finalValue);
    } catch (error) {
      console.error('StorageService:set error:', error);
      throw new Error('Failed to save data to storage');
    }
  }

  async get<T>(key: string, decrypt: boolean = false): Promise<T | null> {
    try {
      const storageKey = this.getStorageKey(key);
      const value = await AsyncStorage.getItem(storageKey);
      
      if (!value) return null;

      const decryptedValue = decrypt ? await this.decryptValue(value) : value;
      return JSON.parse(decryptedValue) as T;
    } catch (error) {
      console.error('StorageService:get error:', error);
      throw new Error('Failed to retrieve data from storage');
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key);
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('StorageService:remove error:', error);
      throw new Error('Failed to remove data from storage');
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      console.error('StorageService:clear error:', error);
      throw new Error('Failed to clear storage');
    }
  }

  // Вспомогательные методы
  private getStorageKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private async encryptValue(value: string): Promise<string> {
    return await encrypt(value);
  }

  private async decryptValue(value: string): Promise<string> {
    return await decrypt(value);
  }
}

// Экспортируем инстанс для использования в приложении
export const storage = new StorageService();

// Хуки для удобного использования
export const useStorage = () => {
  const getTyped = async <K extends keyof StorageKeysType>(
    key: K,
    decrypt?: boolean
  ): Promise<StorageKeysType[K] | null> => {
    return await storage.get<StorageKeysType[K]>(key, decrypt);
  };

  const setTyped = async <K extends keyof StorageKeysType>(
    key: K,
    value: StorageKeysType[K],
    encrypt?: boolean
  ): Promise<void> => {
    await storage.set(key, value, encrypt);
  };

  return {
    get: getTyped,
    set: setTyped,
    remove: storage.remove.bind(storage),
    clear: storage.clear.bind(storage),
  };
};
