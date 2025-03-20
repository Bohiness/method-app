import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { LocalNotification, notificationsService } from './notifications.service';

// Импортируем перечисление для типов триггеров
const { SchedulableTriggerInputTypes } = Notifications;

// Используем локаль устройства
const getDeviceLocale = (): string => {
    const locale =
        Platform.OS === 'ios'
            ? (Notifications as any).locale || 'en'
            : Platform.OS === 'android'
            ? (Notifications as any).locale || 'en'
            : 'en';

    return locale.split('-')[0];
};

// Идентификаторы для наших уведомлений
export const MORNING_NOTIFICATION_ID = 'morning-notification';
export const EVENING_NOTIFICATION_ID = 'evening-notification';

// Тексты для утренних уведомлений (можно добавить больше вариантов)
const MORNING_TITLES = {
    ru: ['Доброе утро!', 'Начните день правильно', 'Время подготовиться к новому дню'],
    en: ['Good morning!', 'Start your day right', 'Time to prepare for a new day'],
};

const MORNING_BODIES = {
    ru: [
        'Пора подготовиться к продуктивному дню',
        'Начните день с планирования задач',
        'Уделите время утренней подготовке',
    ],
    en: [
        'Time to prepare for a productive day',
        'Start your day with planning tasks',
        'Take time for morning preparation',
    ],
};

// Тексты для вечерних уведомлений
const EVENING_TITLES = {
    ru: ['Время для рефлексии', 'Подведите итоги дня', 'Как прошел ваш день?'],
    en: ['Time for reflection', 'Summarize your day', 'How was your day?'],
};

const EVENING_BODIES = {
    ru: ['Уделите время вечерней рефлексии', 'Проанализируйте свой день', 'Запишите свои достижения за день'],
    en: ['Take time for evening reflection', 'Analyze your day', 'Write down your achievements for the day'],
};

class DailyNotificationsService {
    // Время уведомлений по умолчанию
    private morningHour = 8;
    private morningMinute = 0;
    private eveningHour = 20;
    private eveningMinute = 0;

    // Метод для установки времени утреннего уведомления
    setMorningTime(hour: number, minute: number) {
        this.morningHour = hour;
        this.morningMinute = minute;
    }

    // Метод для установки времени вечернего уведомления
    setEveningTime(hour: number, minute: number) {
        this.eveningHour = hour;
        this.eveningMinute = minute;
    }

    // Получение случайного текста из массива
    private getRandomText(texts: Record<string, string[]>): string {
        const locale = getDeviceLocale() as keyof typeof texts;
        const availableTexts = texts[locale] || texts.en; // Если локаль не найдена, используем английский
        const randomIndex = Math.floor(Math.random() * availableTexts.length);
        return availableTexts[randomIndex];
    }

    // Создание триггера для ежедневного уведомления в указанное время
    private createDailyTrigger(hour: number, minute: number): Notifications.NotificationTriggerInput {
        return {
            type: SchedulableTriggerInputTypes.CALENDAR, // Используем CALENDAR вместо TIME
            hour: hour,
            minute: minute,
            repeats: true,
        };
    }

    // Настройка утреннего уведомления
    async scheduleMorningNotification(customHour?: number, customMinute?: number): Promise<string> {
        // Отменяем предыдущее утреннее уведомление, если оно существует
        await this.cancelMorningNotification();

        const title = this.getRandomText(MORNING_TITLES);
        const body = this.getRandomText(MORNING_BODIES);

        // Используем пользовательское время или время по умолчанию
        const hour = customHour !== undefined ? customHour : this.morningHour;
        const minute = customMinute !== undefined ? customMinute : this.morningMinute;

        const notification: LocalNotification = {
            id: MORNING_NOTIFICATION_ID,
            title,
            body,
            data: { type: 'morning_reflection', screen: 'StartYourDay' },
            trigger: this.createDailyTrigger(hour, minute),
        };

        return await notificationsService.scheduleLocalNotification(notification);
    }

    // Настройка вечернего уведомления
    async scheduleEveningNotification(customHour?: number, customMinute?: number): Promise<string> {
        // Отменяем предыдущее вечернее уведомление, если оно существует
        await this.cancelEveningNotification();

        const title = this.getRandomText(EVENING_TITLES);
        const body = this.getRandomText(EVENING_BODIES);

        // Используем пользовательское время или время по умолчанию
        const hour = customHour !== undefined ? customHour : this.eveningHour;
        const minute = customMinute !== undefined ? customMinute : this.eveningMinute;

        const notification: LocalNotification = {
            id: EVENING_NOTIFICATION_ID,
            title,
            body,
            data: { type: 'evening_reflection', screen: 'EveningReflection' },
            trigger: this.createDailyTrigger(hour, minute),
        };

        return await notificationsService.scheduleLocalNotification(notification);
    }

    // Отмена утреннего уведомления
    async cancelMorningNotification(): Promise<void> {
        try {
            // Сначала пробуем отменить по известному ID
            await notificationsService.cancelNotification(MORNING_NOTIFICATION_ID);
        } catch {
            // Если не получилось, поищем по типу (как запасной вариант)
            const notifications = await notificationsService.getScheduledNotifications();
            const morningNotifications = notifications.filter(
                n => n.data && (n.data as any).type === 'morning_reflection'
            );

            for (const notification of morningNotifications) {
                if (notification.id) {
                    await notificationsService.cancelNotification(notification.id);
                }
            }
        }
    }

    // Отмена вечернего уведомления
    async cancelEveningNotification(): Promise<void> {
        try {
            // Сначала пробуем отменить по известному ID
            await notificationsService.cancelNotification(EVENING_NOTIFICATION_ID);
        } catch {
            // Если не получилось, поищем по типу (как запасной вариант)
            const notifications = await notificationsService.getScheduledNotifications();
            const eveningNotifications = notifications.filter(
                n => n.data && (n.data as any).type === 'evening_reflection'
            );

            for (const notification of eveningNotifications) {
                if (notification.id) {
                    await notificationsService.cancelNotification(notification.id);
                }
            }
        }
    }

    // Настройка всех ежедневных уведомлений
    async scheduleAllDailyNotifications(): Promise<void> {
        await this.scheduleMorningNotification();
        await this.scheduleEveningNotification();
    }

    // Отмена всех ежедневных уведомлений
    async cancelAllDailyNotifications(): Promise<void> {
        await this.cancelMorningNotification();
        await this.cancelEveningNotification();
    }
}

export const dailyNotificationsService = new DailyNotificationsService();
