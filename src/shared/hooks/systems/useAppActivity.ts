import { APP_ACTIVITY_CATEGORY_KEYS, APP_ACTIVITY_KEYS, appActivity } from '@shared/constants/system/app-activity';
import { APP_ROUTES } from '@shared/constants/system/app-routes';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { IconName } from '@shared/ui/icon';
import { router } from 'expo-router';
import React from 'react'; // Импортируем React для useMemo

// Вспомогательный тип для извлечения всех строковых значений из вложенного объекта
type DeepStringValue<T> = {
    [K in keyof T]: T[K] extends string
        ? T[K] // Если значение - строка, берем его
        : T[K] extends object
        ? DeepStringValue<T[K]> // Если значение - объект, рекурсивно вызываем для него
        : never; // Иначе (не строка и не объект) игнорируем
}[keyof T]; // Собираем все найденные строковые типы в объединение (union)

// Определяем типы для путей и ключей хранилища
type AppRoutePath = DeepStringValue<typeof APP_ROUTES>;
type StorageKeyValue = DeepStringValue<typeof STORAGE_KEYS>;

export interface AppActivity {
    id: string;
    key: AppActivityKey;
    titleKey: string;
    categoryKey: (typeof APP_ACTIVITY_CATEGORY_KEYS)[number];
    descriptionKey: string;
    icon: IconName;
    path: AppRoutePath;
    storageKey: StorageKeyValue;
}

// Определяем тип для ключей активностей на основе нового массива APP_ACTIVITY_KEYS
export type AppActivityKey = (typeof APP_ACTIVITY_KEYS)[number]; // 'mood' | 'journal' | 'startDay' | 'eveningReflection'

// Используем AppActivityKey
export type ActivityActionMap = Record<AppActivityKey, () => void>;

export const useAppActivityActions = (): ActivityActionMap => {
    const actionMap: ActivityActionMap = {
        mood: () => router.push(`/${APP_ROUTES.MODALS.DIARY.MOOD}`),
        journal: () => router.push(`/${APP_ROUTES.MODALS.DIARY.BEAUTIFUL_DIARY}`),
        startDay: () => router.push(`/${APP_ROUTES.MODALS.DIARY.START_YOUR_DAY}`),
        eveningReflection: () => router.push(`/${APP_ROUTES.MODALS.DIARY.EVENING_REFLECTION}`),
        newTask: () => router.push(`/${APP_ROUTES.MODALS.PLANS.NEW_TASK}`),
        journalNewEntry: () => router.push(`/${APP_ROUTES.MODALS.DIARY.JOURNAL.EDITOR}`),
    };

    return actionMap;
};

// 1. Определяем тип для объединенного объекта
export interface CombinedAppActivity extends AppActivity {
    action: () => void;
}

// 2. Создаем новый хук
export const useAppActivities = (): Record<AppActivityKey, CombinedAppActivity> => {
    const actionMap = useAppActivityActions();

    const combinedActivities = React.useMemo(() => {
        // Используем reduce для создания объекта
        return appActivity.reduce(
            (acc, activity) => {
                // Ключ - activity.key, значение - объект активности с добавленным действием
                acc[activity.key as AppActivityKey] = {
                    ...activity,
                    action: actionMap[activity.key as AppActivityKey],
                };
                return acc;
            },
            {} as Record<AppActivityKey, CombinedAppActivity> // Начальное значение - пустой объект нужного типа
        );
    }, [actionMap]); // Зависимость - actionMap

    return combinedActivities;
};
