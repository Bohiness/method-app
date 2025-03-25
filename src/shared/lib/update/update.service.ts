import i18n from '@shared/config/i18n';
import { logger } from '@shared/lib/logger/logger.service';
import * as Updates from 'expo-updates';
import { Alert, AppState, AppStateStatus, Linking, Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';

type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error';

/**
 * Сервис для управления обновлениями приложения по воздуху (OTA)
 */
class UpdateService {
    private updateStatus: UpdateStatus = 'idle';
    private appState: AppStateStatus = 'unknown';
    private appStateSubscription: any = null;
    private lastStoreCheckTime: number = 0;
    private storeCheckInterval: number = 1000 * 60 * 60 * 24; // Проверяем раз в день

    /**
     * Проверяет наличие обновлений и загружает их, если они доступны
     * @param {boolean} silentMode - Не показывать уведомления пользователю
     * @returns {Promise<boolean>} - true если обновление установлено, false если нет
     */
    async checkForUpdates(silentMode = false): Promise<boolean> {
        try {
            if (__DEV__) {
                logger.debug('Пропуск проверки обновлений в режиме разработки', 'checkForUpdates – UpdateService');
                return false;
            }

            // Устанавливаем статус проверки
            this.updateStatus = 'checking';
            logger.debug('Проверяю наличие обновлений...', 'checkForUpdates – UpdateService');

            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                // Устанавливаем статус загрузки
                this.updateStatus = 'downloading';
                logger.debug('Найдено новое обновление, загружаю...', 'checkForUpdates – UpdateService');

                await Updates.fetchUpdateAsync();

                // Устанавливаем статус готовности
                this.updateStatus = 'ready';
                logger.debug('Обновление загружено, готово к установке', 'checkForUpdates – UpdateService');

                if (!silentMode) {
                    this.showUpdateNotification();
                }

                return true;
            } else {
                // Возвращаем статус в исходное состояние
                this.updateStatus = 'idle';
                logger.debug('Обновлений не найдено', 'checkForUpdates – UpdateService');

                // Если OTA-обновлений нет, проверяем обновления в сторах
                await this.checkStoreUpdates(silentMode);

                return false;
            }
        } catch (error) {
            // Устанавливаем статус ошибки
            this.updateStatus = 'error';
            logger.error(error, 'Ошибка при проверке/загрузке обновлений', 'checkForUpdates – UpdateService');

            // В случае ошибки с OTA-обновлением, все равно проверяем сторы
            await this.checkStoreUpdates(silentMode);

            return false;
        }
    }

    /**
     * Проверяет наличие обновлений в App Store/Google Play
     * @param {boolean} silentMode - Не показывать уведомления пользователю
     * @returns {Promise<boolean>} - true если найдено обновление, false если нет
     */
    async checkStoreUpdates(silentMode = false): Promise<boolean> {
        try {
            // Проверяем только раз в день
            const now = Date.now();
            if (now - this.lastStoreCheckTime < this.storeCheckInterval) {
                logger.debug(
                    'Пропускаем проверку обновлений в сторах (уже проверяли сегодня)',
                    'checkStoreUpdates – UpdateService'
                );
                return false;
            }

            this.lastStoreCheckTime = now;

            logger.debug('Проверяю наличие обновлений в App Store/Google Play...', 'checkStoreUpdates – UpdateService');

            // Проверяем доступность новых версий
            const result = await VersionCheck.needUpdate();

            if (result.isNeeded) {
                logger.debug(
                    `Доступна новая версия в сторе: ${result.storeVersion}`,
                    'checkStoreUpdates – UpdateService'
                );

                if (!silentMode) {
                    this.showStoreUpdateNotification(result.storeVersion);
                }

                return true;
            } else {
                logger.debug('Обновлений в сторах не найдено', 'checkStoreUpdates – UpdateService');
                return false;
            }
        } catch (error) {
            logger.error(error, 'Ошибка при проверке обновлений в сторах', 'checkStoreUpdates – UpdateService');
            return false;
        }
    }

    /**
     * Показывает уведомление пользователю о доступном обновлении через OTA
     */
    private showUpdateNotification(): void {
        Alert.alert(
            i18n.t('update.updateAvailable'),
            i18n.t('update.updateAvailableMessage'),
            [
                {
                    text: i18n.t('common.later'),
                    style: 'cancel',
                },
                {
                    text: i18n.t('common.update'),
                    onPress: () => this.reloadApp(),
                },
            ],
            { cancelable: false }
        );
    }

    /**
     * Показывает уведомление пользователю о доступном обновлении в App Store/Google Play
     * @param {string} storeVersion - Версия приложения, доступная в сторе
     */
    private showStoreUpdateNotification(storeVersion: string): void {
        const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

        Alert.alert(
            i18n.t('update.storeUpdateAvailable'),
            i18n.t('update.storeUpdateAvailableMessage', { version: storeVersion, store: storeName }),
            [
                {
                    text: i18n.t('common.nextTime'),
                    style: 'cancel',
                },
                {
                    text: i18n.t('common.update'),
                    onPress: () => this.openAppInStore(),
                },
            ],
            { cancelable: false }
        );
    }

    /**
     * Открывает страницу приложения в App Store или Google Play
     */
    async openAppInStore(): Promise<void> {
        try {
            logger.debug('Открываю приложение в сторе...', 'openAppInStore – UpdateService');

            const storeUrl = await VersionCheck.getStoreUrl();
            if (storeUrl) {
                await Linking.openURL(storeUrl);
            } else {
                logger.error('Не удалось получить URL стора', 'openAppInStore – UpdateService');
            }
        } catch (error) {
            logger.error(error, 'Ошибка при открытии приложения в сторе', 'openAppInStore – UpdateService');
        }
    }

    /**
     * Перезапускает приложение с новым обновлением
     */
    async reloadApp(): Promise<void> {
        try {
            logger.debug('Перезапуск приложения для применения обновления...', 'reloadApp – UpdateService');
            await Updates.reloadAsync();
        } catch (error) {
            logger.error(error, 'Ошибка при перезапуске приложения с обновлением', 'reloadApp – UpdateService');
        }
    }

    /**
     * Обработчик изменения состояния приложения
     * Проверяет наличие обновлений при возвращении приложения из фона
     */
    private handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
        if (this.appState === 'background' && nextAppState === 'active') {
            logger.debug(
                'Приложение вернулось из фона, проверяю обновления...',
                'handleAppStateChange – UpdateService'
            );
            await this.checkForUpdates(true);
        }
        this.appState = nextAppState;
    };

    /**
     * Инициализирует сервис обновлений
     */
    async initialize(): Promise<void> {
        try {
            // Инициализация подписки на изменение состояния приложения
            this.appState = AppState.currentState;
            this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

            // Инициализируем VersionCheck для проверки обновлений в сторах
            if (!__DEV__) {
                VersionCheck.setAppName('Method do');
            }

            logger.debug('Сервис обновлений инициализирован', 'initialize – UpdateService');
        } catch (error) {
            logger.error(error, 'Ошибка при инициализации сервиса обновлений', 'initialize – UpdateService');
        }
    }
}

export const updateService = new UpdateService();
