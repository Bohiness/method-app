import i18n from '@shared/config/i18n';
import { logger } from '@shared/lib/logger/logger.service';
import * as Updates from 'expo-updates';
import { Alert, AppState, AppStateStatus, Linking, Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';

type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error';

// Add type for options
interface CheckForUpdatesOptions {
    silentMode?: boolean;
    reloadImmediately?: boolean;
    onStatusChange?: (status: UpdateStatus) => void;
}

/**
 * Сервис для управления обновлениями приложения по воздуху (OTA)
 */
class UpdateService {
    private updateStatus: UpdateStatus = 'idle';
    private appState: AppStateStatus = 'unknown';
    private appStateSubscription: any = null;
    private lastStoreCheckTime: number = 0;
    private storeCheckInterval: number = 1000 * 60 * 60 * 24; // Проверяем раз в день

    // Helper to set status and notify
    private setStatus(status: UpdateStatus, options?: CheckForUpdatesOptions) {
        this.updateStatus = status;
        options?.onStatusChange?.(status); // Call the callback if provided
        logger.debug(`Update status changed to: ${status}`, 'setStatus – UpdateService');
    }

    /**
     * Проверяет наличие обновлений и загружает их, если они доступны
     * @param {CheckForUpdatesOptions} options - Опции для проверки обновлений
     * @returns {Promise<boolean>} - true если OTA обновление было загружено (или обновление из стора найдено), false если нет
     */
    async checkForUpdates(options: CheckForUpdatesOptions = {}): Promise<boolean> {
        const { silentMode = false, reloadImmediately = false, onStatusChange } = options;

        try {
            if (__DEV__) {
                logger.debug('Пропуск проверки обновлений в режиме разработки', 'checkForUpdates – UpdateService');
                // Even in dev, report idle status if callback exists
                onStatusChange?.('idle');
                return false;
            }

            // Устанавливаем статус проверки
            this.setStatus('checking', options);
            logger.debug('Проверяю наличие обновлений...', 'checkForUpdates – UpdateService');

            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                // Устанавливаем статус загрузки
                this.setStatus('downloading', options);
                logger.debug('Найдено новое обновление, загружаю...', 'checkForUpdates – UpdateService');

                await Updates.fetchUpdateAsync();

                // Устанавливаем статус готовности
                this.setStatus('ready', options);
                logger.debug('Обновление загружено, готово к установке', 'checkForUpdates – UpdateService');

                if (reloadImmediately) {
                    logger.debug(
                        'Немедленный перезапуск приложения по опции reloadImmediately',
                        'checkForUpdates – UpdateService'
                    );
                    await this.reloadApp(); // Reload immediately if requested
                    // Note: reloadApp might not return if successful
                    return true; // Indicate update was processed
                }

                if (!silentMode) {
                    this.showUpdateNotification();
                }

                return true; // Indicate OTA update was fetched
            } else {
                // Возвращаем статус в исходное состояние
                this.setStatus('idle', options);
                logger.debug('Обновлений OTA не найдено', 'checkForUpdates – UpdateService');

                // Если OTA-обновлений нет, проверяем обновления в сторах
                // Pass silentMode to store check as well
                const storeUpdateNeeded = await this.checkStoreUpdates({ silentMode, onStatusChange });

                return storeUpdateNeeded; // Return result of store check
            }
        } catch (error) {
            // Устанавливаем статус ошибки
            this.setStatus('error', options);
            logger.error(error, 'Ошибка при проверке/загрузке обновлений', 'checkForUpdates – UpdateService');

            // В случае ошибки с OTA-обновлением, все равно проверяем сторы
            // Pass silentMode to store check as well
            const storeUpdateNeeded = await this.checkStoreUpdates({ silentMode, onStatusChange });

            return storeUpdateNeeded; // Return result of store check even after OTA error
        }
    }

    /**
     * Проверяет наличие обновлений в App Store/Google Play
     * @param {CheckForUpdatesOptions} options - Опции для проверки обновлений (используем silentMode и onStatusChange)
     * @returns {Promise<boolean>} - true если найдено обновление, false если нет
     */
    async checkStoreUpdates(options: CheckForUpdatesOptions = {}): Promise<boolean> {
        const { silentMode = false, onStatusChange } = options;
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

            // Report checking status if callback exists and we proceed
            onStatusChange?.('checking');
            logger.debug('Проверяю наличие обновлений в App Store/Google Play...', 'checkStoreUpdates – UpdateService');

            // Проверяем доступность новых версий
            const result = await VersionCheck.needUpdate();

            if (result.isNeeded) {
                // Report ready status for store update if callback exists
                onStatusChange?.('ready');
                logger.debug(
                    `Доступна новая версия в сторе: ${result.latestVersion}`,
                    'checkStoreUpdates – UpdateService'
                );

                if (!silentMode) {
                    this.showStoreUpdateNotification(result.latestVersion);
                }

                return true;
            } else {
                // Report idle status if no store update needed
                onStatusChange?.('idle');
                logger.debug('Обновлений в сторах не найдено', 'checkStoreUpdates – UpdateService');
                return false;
            }
        } catch (error) {
            // Report error status if callback exists
            onStatusChange?.('error');
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
                    text: i18n.t('common.later'),
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
            // Use silent mode, no immediate reload, no status callback needed here (or maybe log status?)
            await this.checkForUpdates({ silentMode: true, reloadImmediately: false });
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

            logger.debug('Сервис обновлений инициализирован', 'initialize – UpdateService');
        } catch (error) {
            logger.error(error, 'Ошибка при инициализации сервиса обновлений', 'initialize – UpdateService');
        }
    }
}

export const updateService = new UpdateService();

// Export the type for use in SplashScreen
export type { UpdateStatus };
