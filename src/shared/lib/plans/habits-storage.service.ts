import { storage } from '@shared/lib/storage/storage.service';
import { CreateHabitDtoType, HabitFiltersType, UpdateHabitDtoType } from '@shared/types/plans/HabitTypes';

// Расширяем тип операции синхронизации, добавляя тип 'complete'
type SyncOperation = {
    type: 'create' | 'update' | 'delete' | 'complete';
    id?: number;
    data?: CreateHabitDtoType | UpdateHabitDtoType;
};

const OFFLINE_HABITS_KEY = 'offline_habits';
const SYNC_QUEUE_KEY = 'habits_sync_queue';

export const habitsStorageService = {
    // Получаем привычки из локального хранилища с простейшей фильтрацией
    getHabits: async (filters?: HabitFiltersType) => {
        let habits: any[] = (await storage.get(OFFLINE_HABITS_KEY)) || [];
        if (filters && filters.title) {
            const titleFilter = filters.title.toLowerCase();
            habits = habits.filter((habit: any) => habit.title.toLowerCase().includes(titleFilter));
        }
        return habits;
    },

    // Получаем очередь синхронизации
    getSyncQueue: async (): Promise<SyncOperation[]> => {
        const queue: SyncOperation[] = (await storage.get(SYNC_QUEUE_KEY)) || [];
        return queue;
    },

    // Очищаем очередь синхронизации
    clearSyncQueue: async () => {
        await storage.set(SYNC_QUEUE_KEY, []);
    },

    // Создаем привычку в оффлайн-режиме и добавляем операцию создания в очередь синхронизации
    createHabit: async (data: CreateHabitDtoType) => {
        const habits: any[] = (await storage.get(OFFLINE_HABITS_KEY)) || [];
        // Генерируем временный идентификатор (например, Date.now())
        const newHabit = { ...data, id: Date.now() };
        habits.push(newHabit);
        await storage.set(OFFLINE_HABITS_KEY, habits);

        const syncQueue: SyncOperation[] = (await storage.get(SYNC_QUEUE_KEY)) || [];
        syncQueue.push({
            type: 'create',
            data,
        });
        await storage.set(SYNC_QUEUE_KEY, syncQueue);

        return newHabit;
    },

    // Обновляем привычку в оффлайн-хранилище и добавляем операцию обновления в очередь синхронизации
    updateHabit: async (id: number, data: UpdateHabitDtoType) => {
        const habits: any[] = (await storage.get(OFFLINE_HABITS_KEY)) || [];
        const updatedHabits = habits.map((habit: any) => {
            if (habit.id === id) {
                return { ...habit, ...data };
            }
            return habit;
        });
        await storage.set(OFFLINE_HABITS_KEY, updatedHabits);

        const syncQueue: SyncOperation[] = (await storage.get(SYNC_QUEUE_KEY)) || [];
        syncQueue.push({
            type: 'update',
            id,
            data,
        });
        await storage.set(SYNC_QUEUE_KEY, syncQueue);

        return updatedHabits.find((habit: any) => habit.id === id);
    },

    // Удаляем привычку из оффлайн-хранилища и добавляем операцию удаления в очередь синхронизации
    deleteHabit: async (id: number) => {
        let habits: any[] = (await storage.get(OFFLINE_HABITS_KEY)) || [];
        habits = habits.filter((habit: any) => habit.id !== id);
        await storage.set(OFFLINE_HABITS_KEY, habits);

        const syncQueue: SyncOperation[] = (await storage.get(SYNC_QUEUE_KEY)) || [];
        syncQueue.push({
            type: 'delete',
            id,
        });
        await storage.set(SYNC_QUEUE_KEY, syncQueue);
    },

    // Завершение (выполнение) привычки для текущего периода в оффлайн-режиме.
    // Здесь мы можем, например, увеличить счетчик выполнений, установить флаг или добавить временную метку.
    completeHabit: async (habitId: number) => {
        let habits: any[] = (await storage.get(OFFLINE_HABITS_KEY)) || [];
        habits = habits.map((habit: any) => {
            if (habit.id === habitId) {
                // Если у привычки уже есть поле completions, увеличиваем его на 1, иначе устанавливаем в 1.
                const completions = habit.completions ? habit.completions + 1 : 1;
                return {
                    ...habit,
                    completions,
                    // Можно отметить, что привычка выполнена для текущего периода
                    completed: true,
                    last_completed_at: new Date().toISOString(),
                };
            }
            return habit;
        });
        await storage.set(OFFLINE_HABITS_KEY, habits);

        const syncQueue: SyncOperation[] = (await storage.get(SYNC_QUEUE_KEY)) || [];
        syncQueue.push({
            type: 'complete',
            id: habitId,
        });
        await storage.set(SYNC_QUEUE_KEY, syncQueue);

        return habits.find((habit: any) => habit.id === habitId);
    },
};
