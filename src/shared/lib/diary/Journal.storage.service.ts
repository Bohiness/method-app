import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { JournalCreate, JournalUpdate, LocalJournal } from '@shared/types/diary/journal/JournalTypes';
import { storage } from '../storage/storage.service';

export class JournalStorageService {
    private readonly STORAGE_KEY = STORAGE_KEYS.DIARY.JOURNAL;
    private readonly TEMPLATE_STORAGE_KEY = STORAGE_KEYS.DIARY.JOURNAL_TEMPLATES;

    // Функция для генерации простого ID
    private generateId(): number {
        return Date.now();
    }

    // Получить все записи журнала
    async getJournals(): Promise<LocalJournal[]> {
        try {
            const storedData = await storage.get<LocalJournal[]>(this.STORAGE_KEY);
            if (!storedData) return [];

            // Проверяем, что storedData является массивом
            if (!Array.isArray(storedData)) {
                console.error('Stored data is not an array:', storedData);
                return [];
            }

            const journals: LocalJournal[] = storedData;
            // Возвращаем только не удаленные записи
            return journals.filter(journal => !journal.is_deleted);
        } catch (error) {
            console.error('Error getting journals:', error);
            return [];
        }
    }

    // Получить запись журнала по ID
    async getJournalById(id: number): Promise<LocalJournal | null> {
        try {
            const journals = await this.getJournals();
            // Сначала ищем по id, затем по local_id
            const journal = journals.find(j => (j.id === id || j.local_id === id) && !j.is_deleted);
            return journal || null;
        } catch (error) {
            console.error(`Error getting journal with id ${id}:`, error);
            return null;
        }
    }

    // Создать новую запись журнала
    async createJournal(data: JournalCreate & { isTemplate?: boolean } = { content: '' }): Promise<LocalJournal> {
        try {
            // Определяем, куда сохранять - в шаблоны или обычные записи
            const storageKey = data.isTemplate ? this.TEMPLATE_STORAGE_KEY : this.STORAGE_KEY;

            const storedData = await storage.get<LocalJournal[]>(storageKey);

            // Инициализируем массив записей
            let journals: LocalJournal[] = [];

            // Проверяем, что storedData является массивом
            if (storedData) {
                if (Array.isArray(storedData)) {
                    journals = storedData;
                } else {
                    console.error('Stored data is not an array:', storedData);
                    // Если данные повреждены, начинаем с пустого массива
                }
            }

            const newJournal: LocalJournal = {
                local_id: this.generateId(),
                user: null,
                id: null,
                created_at: new Date().toISOString(),
                content: data.content,
                emotions: [],
                emotions_data: [],
                primary_emotion: null,
                primary_emotion_data: null,
                emotion: null,
                sentiment: null,
                categories: [],
                categories_data: [],
                primary_category: null,
                primary_category_data: null,
                category: null,
                main_topic: null,
                keywords: null,
                question_count: 0,
                length: data.content.length,
                insights: null,
                triggers: null,
                awareness_level: null,
                is_synced: data.isTemplate ? false : false,
                is_template: data.isTemplate || false,
            };

            journals.push(newJournal);
            await storage.set(storageKey, journals);

            return newJournal;
        } catch (error) {
            console.error('Error creating journal entry:', error);
            throw new Error('Failed to create journal entry');
        }
    }

    // Обновить существующую запись журнала
    async updateJournal(
        id: number,
        data: JournalUpdate,
        options: { isTemplate?: boolean } = {}
    ): Promise<LocalJournal> {
        try {
            // Определяем, где искать - в шаблонах или обычных записях
            const storageKey = options.isTemplate ? this.TEMPLATE_STORAGE_KEY : this.STORAGE_KEY;

            const storedData = await storage.get<LocalJournal[]>(storageKey);

            // Проверяем, что storedData является массивом
            if (!storedData || !Array.isArray(storedData)) {
                console.error('Stored data is not an array or is null:', storedData);
                throw new Error(`Journal with id ${id} not found`);
            }

            const journals: LocalJournal[] = storedData;
            // Ищем по id или local_id
            const index = journals.findIndex(j => j.id === id || j.local_id === id);

            if (index === -1) {
                throw new Error(`Journal with id ${id} not found`);
            }

            const updatedJournal = {
                ...journals[index],
                ...data,
                length: data.content.length, // Обновляем длину при изменении содержимого
                is_synced: options.isTemplate ? false : false, // Шаблоны не синхронизируются
            };

            journals[index] = updatedJournal;
            await storage.set(storageKey, journals);

            return updatedJournal;
        } catch (error) {
            console.error(`Error updating journal with id ${id}:`, error);
            throw error;
        }
    }

    // Удалить запись журнала (мягкое удаление)
    async deleteJournal(id: number): Promise<void> {
        try {
            const storedData = await storage.get<LocalJournal[]>(this.STORAGE_KEY);

            // Проверяем формат данных и преобразуем их в массив
            let journals: LocalJournal[] = [];

            if (!storedData) {
                throw new Error(`Journal with id ${id} not found`);
            }

            if (Array.isArray(storedData)) {
                journals = storedData;
            } else if (typeof storedData === 'string') {
                // Пытаемся распарсить строку как JSON
                try {
                    const parsedData = JSON.parse(storedData);
                    if (Array.isArray(parsedData)) {
                        journals = parsedData;
                    } else {
                        console.error('Parsed data is not an array:', parsedData);
                        throw new Error(`Journal with id ${id} not found`);
                    }
                } catch (parseError) {
                    console.error('Error parsing stored data:', parseError);
                    throw new Error(`Journal with id ${id} not found`);
                }
            } else {
                console.error('Stored data is not an array or string:', storedData);
                throw new Error(`Journal with id ${id} not found`);
            }

            // Ищем по id или local_id
            const index = journals.findIndex(j => j.id === id || j.local_id === id);

            if (index === -1) {
                throw new Error(`Journal with id ${id} not found`);
            }

            journals[index] = {
                ...journals[index],
                is_deleted: true,
                is_synced: false,
            };

            await storage.set(this.STORAGE_KEY, journals);
        } catch (error) {
            console.error(`Error deleting journal with id ${id}:`, error);
            throw error;
        }
    }

    // Получить все записи журнала, включая удаленные, для синхронизации
    async getAllJournalsForSync(): Promise<LocalJournal[]> {
        try {
            const storedData = await storage.get<LocalJournal[]>(this.STORAGE_KEY);
            if (!storedData) return [];

            // Проверяем, что storedData является массивом
            if (!Array.isArray(storedData)) {
                console.error('Stored data is not an array:', storedData);
                return [];
            }

            const journals: LocalJournal[] = storedData;
            // Фильтруем, исключая шаблоны и уже синхронизированные записи
            return journals.filter(journal => !journal.is_synced && !journal.is_template);
        } catch (error) {
            console.error('Error getting journals for sync:', error);
            return [];
        }
    }

    // Отметить записи журнала как синхронизированные и обновить id
    async markAsSynced(localIds: number[], serverData: Record<number, number>): Promise<void> {
        try {
            const storedData = await storage.get<LocalJournal[]>(this.STORAGE_KEY);
            if (!storedData) return;

            // Проверяем, что storedData является массивом
            if (!Array.isArray(storedData)) {
                console.error('Stored data is not an array:', storedData);
                return;
            }

            const journals: LocalJournal[] = storedData;

            const updatedJournals = journals.map(journal => {
                if (localIds.includes(journal.local_id)) {
                    const serverId = serverData[journal.local_id];
                    if (serverId && typeof serverId === 'number') {
                        return {
                            ...journal,
                            is_synced: true,
                            id: serverId, // Устанавливаем id с сервера, убеждаемся что он отличается от local_id
                        };
                    }
                }
                return journal;
            });

            await storage.set(this.STORAGE_KEY, updatedJournals);
        } catch (error) {
            console.error('Error marking journals as synced:', error);
            throw error;
        }
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С ШАБЛОНАМИ ===

    // Получить все шаблоны
    async getDraft(): Promise<LocalJournal[]> {
        try {
            const storedData = await storage.get<LocalJournal[]>(this.TEMPLATE_STORAGE_KEY);
            if (!storedData) return [];

            // Проверяем, что storedData является массивом
            if (!Array.isArray(storedData)) {
                console.error('Stored data is not an array:', storedData);
                return [];
            }

            const templates: LocalJournal[] = storedData;
            // Возвращаем только не удаленные записи
            return templates.filter(template => !template.is_deleted);
        } catch (error) {
            console.error('Error getting templates:', error);
            return [];
        }
    }

    // Получить шаблон по ID
    async getTemplateById(id: number): Promise<LocalJournal | null> {
        try {
            const templates = await this.getDraft();
            // Ищем по id или local_id
            const template = templates.find(t => (t.id === id || t.local_id === id) && !t.is_deleted);
            return template || null;
        } catch (error) {
            console.error(`Error getting template with id ${id}:`, error);
            return null;
        }
    }

    // Удалить шаблон
    async deleteTemplate(id: number): Promise<void> {
        try {
            const storedData = await storage.get<LocalJournal[]>(this.TEMPLATE_STORAGE_KEY);

            if (!storedData || !Array.isArray(storedData)) {
                throw new Error(`Template with id ${id} not found`);
            }

            const templates: LocalJournal[] = storedData;
            // Ищем по id или local_id
            const index = templates.findIndex(t => t.id === id || t.local_id === id);

            if (index === -1) {
                throw new Error(`Template with id ${id} not found`);
            }

            templates[index] = {
                ...templates[index],
                is_deleted: true,
            };

            await storage.set(this.TEMPLATE_STORAGE_KEY, templates);
        } catch (error) {
            console.error(`Error deleting template with id ${id}:`, error);
            throw error;
        }
    }

    // Преобразовать шаблон в журнал
    async convertTemplateToJournal(id: number): Promise<LocalJournal> {
        try {
            // Получаем шаблон
            const template = await this.getTemplateById(id);
            if (!template) {
                throw new Error(`Template with id ${id} not found`);
            }

            // Создаем новую запись журнала на основе шаблона
            const newJournal = await this.createJournal({
                content: template.content,
            });

            // Удаляем шаблон
            await this.deleteTemplate(id);

            return newJournal;
        } catch (error) {
            console.error(`Error converting template to journal with id ${id}:`, error);
            throw error;
        }
    }
}
