// src/shared/lib/storage/storage.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeysType } from '@shared/types/user/StorageKeysType';
import { decrypt, encrypt } from './crypto.service';

export class StorageService {
    private readonly prefix: string = '@method-app:';

    private isEncryptedValue(value: string): boolean {
        try {
            JSON.parse(value);
            return false;
        } catch {
            return value.startsWith('U2F');
        }
    }

    private async getRawValue(key: string): Promise<string | null> {
        return await AsyncStorage.getItem(this.getStorageKey(key));
    }

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

            // Если значение должно быть расшифровано или похоже на зашифрованное
            if (decrypt || this.isEncryptedValue(value)) {
                try {
                    const decryptedValue = await this.decryptValue(value);
                    return JSON.parse(decryptedValue) as T;
                } catch (decryptError) {
                    console.warn('Failed to decrypt value:', decryptError);
                    return null;
                }
            }

            try {
                // Пытаемся распарсить JSON, даже если это изначально строка
                return JSON.parse(value) as T;
            } catch (parseError) {
                // Если не удалось распарсить, возможно это просто строка
                console.warn('Failed to parse JSON, returning as is:', parseError);
                return value as unknown as T;
            }
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

    /**
     * Получает все ключи из хранилища, относящиеся к приложению
     * @returns Promise<string[]> Массив ключей без префикса
     */
    async getAllKeys(): Promise<string[]> {
        try {
            // Получаем все ключи из AsyncStorage
            const allKeys = await AsyncStorage.getAllKeys();
            if (!allKeys || !Array.isArray(allKeys)) {
                console.warn('StorageService:getAllKeys - No keys found or invalid response');
                return [];
            }

            // Фильтруем ключи, относящиеся к нашему приложению
            const appKeys = allKeys.filter(key => key.startsWith(this.prefix));

            // Убираем префикс из ключей
            return appKeys.map(key => key.slice(this.prefix.length));
        } catch (error) {
            console.error('StorageService:getAllKeys error:', error);
            return [];
        }
    }

    async getStorageSize(): Promise<{
        totalSize: number;
        items: Array<{
            key: string;
            size: number;
            value: string;
        }>;
    }> {
        try {
            const keys = await this.getAllKeys();
            const items: Array<{ key: string; size: number; value: string }> = [];

            // Получаем данные для каждого ключа
            const allItems = await Promise.all(
                keys.map(async key => {
                    try {
                        const rawValue = await this.getRawValue(key);
                        if (!rawValue) return null;

                        let displayValue: string;
                        const isEncrypted = this.isEncryptedValue(rawValue);

                        if (isEncrypted) {
                            // Пробуем расшифровать, если это зашифрованное значение
                            try {
                                const decryptedValue = await this.decryptValue(rawValue);
                                displayValue = decryptedValue;
                            } catch {
                                displayValue = '[Encrypted Value]';
                            }
                        } else {
                            // Пытаемся отформатировать JSON
                            try {
                                const parsed = JSON.parse(rawValue);
                                displayValue = JSON.stringify(parsed);
                            } catch {
                                displayValue = rawValue;
                            }
                        }

                        const size = new Blob([rawValue]).size;

                        return {
                            key,
                            size,
                            value: displayValue,
                        };
                    } catch (error) {
                        console.warn(`Failed to get size for key: ${key}`, error);
                        return null;
                    }
                })
            );

            // Фильтруем null значения и считаем общий размер
            const validItems = allItems.filter((item): item is NonNullable<typeof item> => item !== null);
            const totalSize = validItems.reduce((acc, item) => acc + item.size, 0);

            // Сортируем по размеру по убыванию
            return {
                totalSize,
                items: validItems.sort((a, b) => b.size - a.size),
            };
        } catch (error) {
            console.error('StorageService:getStorageSize error:', error);
            return {
                totalSize: 0,
                items: [],
            };
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
        getAllKeys: storage.getAllKeys.bind(storage),
        getStorageSize: storage.getStorageSize.bind(storage),
    };
};
