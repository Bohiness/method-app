import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { JournalStorageService } from '@shared/lib/diary/Journal.storage.service';
import {
    Journal,
    LocalJournal as JournalLocalType,
    JournalStatistics,
    PsyProfile,
} from '@shared/types/diary/journal/JournalTypes';
import axios from 'axios';

export class JournalSyncService {
    private readonly API_URL = API_ROUTES.DIARY.JOURNAL;
    private readonly PROFILE_URL = `${API_ROUTES.DIARY.JOURNAL}profile/`;
    private readonly STATISTICS_URL = `${API_ROUTES.DIARY.JOURNAL}statistics/`;
    private readonly ANALYZE_URL = (id: number) => `${API_ROUTES.DIARY.JOURNAL}${id}/analyze/`;

    constructor(private storageService: JournalStorageService) {}

    // Синхронизировать все изменения с сервером
    async syncChanges(): Promise<void> {
        try {
            const journalsToSync = await this.storageService.getAllJournalsForSync();
            if (journalsToSync.length === 0) return;

            const syncedLocalIds: number[] = [];
            const localToServerIdMap: Record<number, number> = {};

            for (const journal of journalsToSync) {
                try {
                    // Пропускаем шаблоны - они не должны синхронизироваться
                    if (journal.is_template) continue;

                    let serverJournal: Journal | null = null;

                    // Проверяем, есть ли уже id с сервера
                    // Important: id должен быть серверным id, а не локальным
                    if (journal.id && typeof journal.id === 'number' && journal.id !== journal.local_id) {
                        // Если есть id, то запись уже была синхронизирована
                        if (journal.is_deleted) {
                            await this.deleteJournal(journal.id);
                        } else {
                            serverJournal = await this.updateJournal(journal);
                        }
                    } else {
                        // Если id нет или он совпадает с local_id, значит это новая запись
                        if (!journal.is_deleted) {
                            serverJournal = await this.createJournal(journal);
                        }
                    }

                    syncedLocalIds.push(journal.local_id);

                    // Сохраняем соответствие local_id и id с сервера
                    if (serverJournal && serverJournal.id) {
                        localToServerIdMap[journal.local_id] = serverJournal.id;
                    }
                } catch (error) {
                    console.error(`Failed to sync journal ${journal.local_id}:`, error);
                }
            }

            if (syncedLocalIds.length > 0) {
                await this.storageService.markAsSynced(syncedLocalIds, localToServerIdMap);
            }
        } catch (error) {
            console.error('Failed to sync journals:', error);
            throw error;
        }
    }

    // Получить все записи журнала с сервера с возможностью фильтрации
    async fetchJournals(params?: {
        created_at?: string;
        category?: string;
        emotion?: string;
        awareness_level?: string;
        search?: string;
        page?: number;
        page_size?: number;
    }): Promise<{ results: Journal[]; count: number; next: string | null; previous: string | null }> {
        try {
            const response = await apiClient.get<{
                results: Journal[];
                count: number;
                next: string | null;
                previous: string | null;
            }>(this.API_URL, { params });
            return response;
        } catch (error) {
            console.error('Failed to fetch journals:', error);
            throw error;
        }
    }

    // Получить конкретную запись журнала с сервера
    async getJournal(id: number): Promise<Journal | null> {
        try {
            const response = await apiClient.get<Journal>(`${this.API_URL}${id}/`);
            return response;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            console.error(`Failed to get journal ${id}:`, error);
            throw error;
        }
    }

    // Создать новую запись журнала на сервере
    async createJournal(journal: JournalLocalType): Promise<Journal> {
        try {
            // Если это шаблон - не отправляем на сервер
            if (journal.is_template) {
                throw new Error('Templates should not be synchronized with the server');
            }

            // Важно: отправляем только контент, независимо от других полей
            // Не включаем id или local_id в запрос
            const response = await apiClient.post<Journal>(this.API_URL, { content: journal.content });
            return response;
        } catch (error) {
            console.error('Failed to create journal entry:', error);
            throw error;
        }
    }

    // Обновить существующую запись журнала на сервере
    async updateJournal(journal: JournalLocalType): Promise<Journal> {
        try {
            // Если это шаблон - не отправляем на сервер
            if (journal.is_template) {
                throw new Error('Templates should not be synchronized with the server');
            }

            // Проверяем наличие id с сервера
            if (!journal.id || typeof journal.id !== 'number' || journal.id === journal.local_id) {
                throw new Error('Cannot update journal without valid server id');
            }

            // Отправляем только контент, остальное сервер добавит после анализа
            const response = await apiClient.put<Journal>(`${this.API_URL}${journal.id}/`, {
                content: journal.content,
            });
            return response;
        } catch (error) {
            console.error(`Failed to update journal ${journal.id || journal.local_id}:`, error);
            throw error;
        }
    }

    // Удалить запись журнала на сервере
    async deleteJournal(id: number): Promise<void> {
        try {
            await apiClient.delete(`${this.API_URL}${id}/`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return; // Если запись не найдена на сервере, считаем удаление успешным
            }
            console.error(`Failed to delete journal ${id}:`, error);
            throw error;
        }
    }

    // Получить профиль пользователя
    async getUserProfile(): Promise<PsyProfile> {
        try {
            const response = await apiClient.get<PsyProfile>(this.PROFILE_URL);
            return response;
        } catch (error) {
            console.error('Failed to get user profile:', error);
            throw error;
        }
    }

    // Получить статистику по записям
    async getStatistics(): Promise<JournalStatistics> {
        try {
            const response = await apiClient.get<JournalStatistics>(this.STATISTICS_URL);
            return response;
        } catch (error) {
            console.error('Failed to get journal statistics:', error);
            throw error;
        }
    }

    // Повторный анализ записи
    async analyzeJournal(id: number): Promise<Journal> {
        try {
            // Проверяем, имеется ли серверный id
            const journal = await this.storageService.getJournalById(id);
            if (!journal) {
                throw new Error(`Journal with id ${id} not found`);
            }

            if (!journal.id) {
                throw new Error('Cannot analyze journal without server id');
            }

            const response = await apiClient.get<Journal>(this.ANALYZE_URL(journal.id));
            return response;
        } catch (error) {
            console.error(`Failed to analyze journal ${id}:`, error);
            throw error;
        }
    }

    // Полная синхронизация с сервером (получение всех записей и обновление локального хранилища)
    async fullSync(): Promise<void> {
        try {
            // Сначала отправляем все локальные изменения (кроме шаблонов)
            await this.syncChanges();

            // Затем получаем все записи с сервера
            const { results } = await this.fetchJournals();

            // TODO: Здесь нужно реализовать логику обновления локального хранилища,
            // добавляя новые записи и обновляя существующие
            // Важно: не перезаписывать и не удалять шаблоны
        } catch (error) {
            console.error('Failed to perform full sync:', error);
            throw error;
        }
    }
}
