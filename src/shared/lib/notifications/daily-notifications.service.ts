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
const MORNING_NOTIFICATION_ID = 'morning-notification';
const EVENING_NOTIFICATION_ID = 'evening-notification';

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
            type: SchedulableTriggerInputTypes.CALENDAR,
            hour: hour,
            minute: minute,
            repeats: true,
        };
    }

    // Настройка утреннего уведомления
    async scheduleMorningNotification(): Promise<string> {
        // Отменяем предыдущее утреннее уведомление, если оно существует
        await this.cancelMorningNotification();

        const title = this.getRandomText(MORNING_TITLES);
        const body = this.getRandomText(MORNING_BODIES);

        const notification: LocalNotification = {
            title,
            body,
            data: { type: 'morning_reflection', screen: 'StartYourDay' },
            trigger: this.createDailyTrigger(8, 55),
        };

        return await notificationsService.scheduleLocalNotification(notification);
    }

    // Настройка вечернего уведомления
    async scheduleEveningNotification(): Promise<string> {
        // Отменяем предыдущее вечернее уведомление, если оно существует
        await this.cancelEveningNotification();

        const title = this.getRandomText(EVENING_TITLES);
        const body = this.getRandomText(EVENING_BODIES);

        const notification: LocalNotification = {
            id: EVENING_NOTIFICATION_ID,
            title,
            body,
            data: { type: 'evening_reflection', screen: 'EveningReflection' },
            trigger: this.createDailyTrigger(20, 55),
        };

        return await notificationsService.scheduleLocalNotification(notification);
    }

    // Отмена утреннего уведомления
    async cancelMorningNotification(): Promise<void> {
        const notifications = await notificationsService.getScheduledNotifications();
        const morningNotification = notifications.find(n => n.data && (n.data as any).type === 'morning_reflection');

        if (morningNotification && morningNotification.id) {
            await notificationsService.cancelNotification(morningNotification.id);
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
