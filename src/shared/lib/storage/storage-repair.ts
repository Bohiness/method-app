import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from './storage.service';

/**
 * Утилита для исправления формата данных в хранилище
 * Проверяет формат данных для известных ключей и исправляет его при необходимости
 */
export class StorageRepairService {
    private static readonly prefix: string = '@method-app:';

    /**
     * Получает ключ для хранения в AsyncStorage
     */
    private static getStorageKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    /**
     * Исправляет формат данных для записей начала дня и вечерней рефлексии
     * Преобразует объекты в массивы, если необходимо
     */
    static async repairDiaryEntries(): Promise<{
        startDayFixed: boolean;
        eveningReflectionFixed: boolean;
        message: string;
    }> {
        const result = {
            startDayFixed: false,
            eveningReflectionFixed: false,
            message: '',
        };

        try {
            // Исправляем формат данных для записей начала дня
            await this.repairDataFormat('start_day');
            result.startDayFixed = true;

            // Исправляем формат данных для вечерних рефлексий
            await this.repairDataFormat('evening-reflections');
            result.eveningReflectionFixed = true;

            result.message = 'Все данные успешно исправлены';
            return result;
        } catch (error) {
            console.error('Ошибка исправления данных:', error);
            result.message = `Ошибка исправления данных: ${error instanceof Error ? error.message : String(error)}`;
            return result;
        }
    }

    /**
     * Исправляет формат данных для указанного ключа
     * @param key Ключ для исправления формата данных
     */
    private static async repairDataFormat(key: string): Promise<void> {
        try {
            // Получаем текущие данные
            const rawValue = await AsyncStorage.getItem(this.getStorageKey(key));
            if (!rawValue) return; // Данных нет, нечего исправлять

            try {
                // Пытаемся распарсить JSON
                const parsedValue = JSON.parse(rawValue);

                // Если данные уже являются массивом, ничего не делаем
                if (Array.isArray(parsedValue)) {
                    console.log(`Данные для ключа ${key} уже в правильном формате`);
                    return;
                }

                // Проверяем случай "строки в строке" (двойной JSON.stringify)
                if (typeof parsedValue === 'string') {
                    try {
                        // Пытаемся распарсить внутреннюю строку как JSON
                        const innerParsed = JSON.parse(parsedValue);

                        // Если внутренние данные - массив, сохраняем их напрямую
                        if (Array.isArray(innerParsed)) {
                            console.log(`Исправление двойной сериализации для ключа ${key}`);
                            await storage.set(key, innerParsed);
                            return;
                        }

                        // Если внутренние данные - объект, но не массив, оборачиваем в массив
                        if (typeof innerParsed === 'object' && innerParsed !== null) {
                            console.log(`Преобразование внутреннего объекта в массив для ключа ${key}`);
                            await storage.set(key, [innerParsed]);
                            return;
                        }
                    } catch (innerError) {
                        // Если не удалось распарсить внутреннюю строку как JSON, игнорируем
                        console.warn(`Не удалось распарсить внутреннюю строку как JSON для ключа ${key}`, innerError);
                    }
                }

                // Если это объект, но не массив, преобразуем его в массив
                if (typeof parsedValue === 'object' && parsedValue !== null) {
                    console.log(`Преобразование объекта в массив для ключа ${key}`);
                    await storage.set(key, [parsedValue]);
                    return;
                }

                // Если это не объект и не массив, создаем пустой массив
                console.log(`Создание пустого массива для ключа ${key}`);
                await storage.set(key, []);
            } catch (parseError) {
                // Если не удалось распарсить, создаем пустой массив
                console.warn(`Не удалось распарсить данные для ключа ${key}`, parseError);
                await storage.set(key, []);
            }
        } catch (error) {
            console.error(`Ошибка исправления формата данных для ключа ${key}:`, error);
            throw error;
        }
    }
}

// Для использования в приложении
export const useStorageRepair = () => {
    return {
        repairDiaryEntries: StorageRepairService.repairDiaryEntries,
    };
};
