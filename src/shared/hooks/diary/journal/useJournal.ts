import { JournalSyncService } from '@shared/api/diary/JournalSyncService';
import { QUERY_KEYS } from '@shared/constants/QUERY_KEYS';
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal';
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { JournalStorageService } from '@shared/lib/diary/Journal.storage.service';
import { Journal, JournalCreate, JournalStatistics, PsyProfile } from '@shared/types/diary/journal/JournalTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';
import { useMemo } from 'react';

const journalStorageService = new JournalStorageService();
const journalSyncService = new JournalSyncService(journalStorageService);

// Максимальное количество записей для бесплатной версии
const FREE_JOURNALS_LIMIT = 5;

/**
 * Хук для работы с записями журнала
 * Предоставляет методы для создания, обновления, удаления и получения записей журнала
 */
export const useJournal = () => {
    const queryClient = useQueryClient();
    const { isOnline } = useNetwork();
    const { checkPremiumAccess } = useSubscriptionModal();

    const openJournalModal = async () => {
        // Получаем текущие записи для проверки их количества
        const journals = await journalStorageService.getJournals();

        // Если количество записей больше или равно лимиту, проверяем наличие премиум-подписки
        if (journals.length >= FREE_JOURNALS_LIMIT) {
            const hasPremium = await checkPremiumAccess({
                text: 'subscription.journal_limit',
            });

            // Если нет премиум-подписки, модальное окно подписки уже показано функцией checkPremiumAccess
            if (!hasPremium) {
                return;
            }
        }

        // Если есть премиум или количество записей меньше лимита, открываем модальное окно создания записи
        router.push('/(modals)/(diary)/journal');
    };

    // Общая функция для дебаунсированной синхронизации
    const debouncedSync = useMemo(
        () =>
            debounce(async () => {
                try {
                    await journalSyncService.syncChanges();
                    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL] });
                } catch (error) {
                    console.error('Failed to sync changes:', error);
                }
            }, 1000),
        [queryClient]
    );

    // Мутация для создания новой записи журнала
    const createMutation = useMutation({
        mutationFn: async (data: JournalCreate & { isTemplate?: boolean } = { content: '' }) => {
            // Если это шаблон, пропускаем проверку лимита
            if (!data.isTemplate) {
                // Получаем текущие записи для проверки их количества
                const journals = await journalStorageService.getJournals();

                // Если количество записей больше или равно лимиту, проверяем наличие премиум-подписки
                if (journals.length >= FREE_JOURNALS_LIMIT) {
                    const hasPremium = await checkPremiumAccess({
                        text: 'subscription.journal_limit',
                    });

                    // Если нет премиум-подписки, прерываем создание
                    if (!hasPremium) {
                        throw new Error('Premium subscription required');
                    }
                }
            }

            // Сохраняем в локальное хранилище
            const newJournal = await journalStorageService.createJournal(data);

            // Если онлайн и это не шаблон, запускаем дебаунсированную синхронизацию
            if (isOnline && !data.isTemplate) {
                debouncedSync();
            }

            return newJournal;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_TEMPLATES] });
        },
    });

    // Мутация для обновления записи журнала
    const updateMutation = useMutation({
        mutationFn: async ({ id, data, isTemplate }: { id: number; data: JournalCreate; isTemplate?: boolean }) => {
            // Обновляем в локальном хранилище - id может быть как local_id, так и id с сервера
            const updatedJournal = await journalStorageService.updateJournal(id, data, { isTemplate });

            // Если онлайн и это не шаблон, запускаем дебаунсированную синхронизацию
            if (isOnline && !isTemplate) {
                debouncedSync();
            }

            return updatedJournal;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_TEMPLATES] });
        },
    });

    // Мутация для удаления записи журнала
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            // Удаляем из локального хранилища - id может быть как local_id, так и id с сервера
            await journalStorageService.deleteJournal(id);

            // Если онлайн, запускаем дебаунсированную синхронизацию
            if (isOnline) {
                debouncedSync();
            }

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL] });
        },
    });

    // Мутация для повторного анализа записи журнала
    const analyzeMutation = useMutation({
        mutationFn: async (id: number) => {
            if (!isOnline) {
                throw new Error('Cannot analyze journal while offline');
            }

            // Получаем запись по id или local_id
            const journal = await journalStorageService.getJournalById(id);
            if (!journal) {
                throw new Error(`Journal with id ${id} not found`);
            }

            // Проверяем, имеет ли запись id с сервера
            if (!journal.id) {
                throw new Error('Cannot analyze journal without server id. Please sync first.');
            }

            // Запускаем анализ на сервере
            const analyzedJournal = await journalSyncService.analyzeJournal(journal.id);

            // Обновляем запись в локальном хранилище
            await journalStorageService.updateJournal(id, {
                content: analyzedJournal.content,
            });

            return analyzedJournal;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL] });
        },
    });

    // Функция для получения истории записей
    const getHistory = (params?: {
        created_at?: string;
        category?: string;
        emotion?: string;
        awareness_level?: string;
        search?: string;
    }) => {
        return useQuery<Journal[], Error>({
            queryKey: [QUERY_KEYS.JOURNAL, params],
            queryFn: async () => {
                if (isOnline) {
                    try {
                        await journalSyncService.syncChanges();

                        // Если есть параметры фильтрации, получаем данные с сервера
                        if (params && Object.keys(params).length > 0) {
                            const { results } = await journalSyncService.fetchJournals(params);
                            return results;
                        }
                    } catch (error) {
                        console.error('Failed to sync changes:', error);
                    }
                }
                return journalStorageService.getJournals();
            },
        });
    };

    // Функция для получения деталей конкретной записи
    const getDetails = (id: number | undefined) => {
        return useQuery<Journal | null, Error>({
            queryKey: [QUERY_KEYS.JOURNAL, id],
            queryFn: async () => {
                if (!id) return null;

                if (isOnline) {
                    try {
                        await journalSyncService.syncChanges();

                        // Получаем запись по id или local_id
                        const journal = await journalStorageService.getJournalById(id);

                        // Если у записи есть id с сервера, пытаемся получить обновленную версию
                        if (journal && journal.id) {
                            const serverJournal = await journalSyncService.getJournal(journal.id);
                            if (serverJournal) {
                                return serverJournal;
                            }
                        }
                    } catch (error) {
                        console.error('Failed to sync changes:', error);
                    }
                }
                return journalStorageService.getJournalById(id);
            },
            enabled: !!id,
        });
    };

    // Получение статистики
    const getStatistics = () => {
        return useQuery<JournalStatistics, Error>({
            queryKey: [QUERY_KEYS.JOURNAL_STATISTICS],
            queryFn: async () => {
                if (!isOnline) {
                    throw new Error('Cannot fetch statistics while offline');
                }
                return journalSyncService.getStatistics();
            },
            enabled: isOnline,
        });
    };

    // Получение психологического профиля
    const getProfile = () => {
        return useQuery<PsyProfile, Error>({
            queryKey: [QUERY_KEYS.PSY_PROFILE],
            queryFn: async () => {
                if (!isOnline) {
                    throw new Error('Cannot fetch profile while offline');
                }
                return journalSyncService.getUserProfile();
            },
            enabled: isOnline,
        });
    };

    // Функция для получения шаблонов
    const getTemplates = () => {
        return useQuery<Journal[], Error>({
            queryKey: [QUERY_KEYS.JOURNAL_TEMPLATES],
            queryFn: async () => {
                return journalStorageService.getTemplates();
            },
        });
    };

    // Функция для получения деталей конкретного шаблона
    const getTemplateDetails = (id: number | undefined) => {
        return useQuery<Journal | null, Error>({
            queryKey: [QUERY_KEYS.JOURNAL_TEMPLATES, id],
            queryFn: async () => {
                if (!id) return null;
                return journalStorageService.getTemplateById(id);
            },
            enabled: !!id,
        });
    };

    // Мутация для удаления шаблона
    const deleteTemplateMutation = useMutation({
        mutationFn: async (id: number) => {
            await journalStorageService.deleteTemplate(id);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_TEMPLATES] });
        },
    });

    // Мутация для преобразования шаблона в журнал
    const convertTemplateToJournalMutation = useMutation({
        mutationFn: async (id: number) => {
            const journal = await journalStorageService.convertTemplateToJournal(id);

            // Если онлайн, запускаем дебаунсированную синхронизацию
            if (isOnline) {
                debouncedSync();
            }

            return journal;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_TEMPLATES] });
        },
    });

    // Возвращаем все функции как единый объект
    return {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
        analyze: analyzeMutation,
        getHistory,
        getDetails,
        getStatistics,
        getProfile,
        openJournalModal,
        // Новые методы для работы с шаблонами
        getTemplates,
        getTemplateDetails,
        deleteTemplate: deleteTemplateMutation,
        convertTemplateToJournal: convertTemplateToJournalMutation,
        // Состояние загрузки для всех операций
        isPending: {
            create: createMutation.isPending,
            update: updateMutation.isPending,
            delete: deleteMutation.isPending,
            analyze: analyzeMutation.isPending,
            templates: {
                delete: deleteTemplateMutation.isPending,
                convert: convertTemplateToJournalMutation.isPending,
            },
        },
    };
};

// Для обратной совместимости оставляем отдельные хуки
export const useCreateJournal = () => {
    const { create } = useJournal();
    return {
        ...create,
        isPending: create.isPending,
    };
};

export const useUpdateJournal = () => {
    const { update } = useJournal();
    return {
        ...update,
        isPending: update.isPending,
    };
};

export const useDeleteJournal = () => {
    const { delete: deleteJournal } = useJournal();
    return {
        ...deleteJournal,
        isPending: deleteJournal.isPending,
    };
};

export const useAnalyzeJournal = () => {
    const { analyze } = useJournal();
    return {
        ...analyze,
        isPending: analyze.isPending,
    };
};

export const useJournalHistory = (params?: {
    created_at?: string;
    category?: string;
    emotion?: string;
    awareness_level?: string;
    search?: string;
}) => {
    const { getHistory } = useJournal();
    const query = getHistory(params);
    return {
        ...query,
        isPending: query.isPending,
    };
};

export const useJournalDetails = (id: number | undefined) => {
    const { getDetails } = useJournal();
    const query = getDetails(id);
    return {
        ...query,
        isPending: query.isPending,
    };
};

export const useJournalStatistics = () => {
    const { getStatistics } = useJournal();
    const query = getStatistics();
    return {
        ...query,
        isPending: query.isPending,
    };
};

export const useJournalProfile = () => {
    const { getProfile } = useJournal();
    const query = getProfile();
    return {
        ...query,
        isPending: query.isPending,
    };
};

// Добавляем хуки для работы с шаблонами
export const useJournalTemplates = () => {
    const { getTemplates } = useJournal();
    const query = getTemplates();
    return {
        ...query,
        isPending: query.isPending,
    };
};

export const useJournalTemplateDetails = (id: number | undefined) => {
    const { getTemplateDetails } = useJournal();
    const query = getTemplateDetails(id);
    return {
        ...query,
        isPending: query.isPending,
    };
};

export const useDeleteJournalTemplate = () => {
    const { deleteTemplate } = useJournal();
    return {
        ...deleteTemplate,
        isPending: deleteTemplate.isPending,
    };
};

export const useConvertTemplateToJournal = () => {
    const { convertTemplateToJournal } = useJournal();
    return {
        ...convertTemplateToJournal,
        isPending: convertTemplateToJournal.isPending,
    };
};
