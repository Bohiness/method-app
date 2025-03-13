import * as Localization from 'expo-localization';
import { NativeModules, Platform } from 'react-native';

class I18nService {
    private _locale: string;

    constructor() {
        // Получаем локаль устройства
        this._locale = Localization.locale || this.getDeviceLocale() || 'en';
    }

    // Получение локали устройства через нативные модули
    private getDeviceLocale(): string {
        try {
            // iOS
            if (Platform.OS === 'ios') {
                const locale =
                    NativeModules.SettingsManager?.settings?.AppleLocale ||
                    NativeModules.SettingsManager?.settings?.AppleLanguages[0];
                return locale;
            }
            // Android
            else if (Platform.OS === 'android') {
                return NativeModules.I18nManager?.localeIdentifier || '';
            }
            return '';
        } catch (error) {
            console.error('Ошибка при получении локали устройства:', error);
            return '';
        }
    }

    // Геттер для получения текущей локали
    get locale(): string {
        return this._locale;
    }

    // Метод для установки локали вручную
    setLocale(locale: string): void {
        this._locale = locale;
    }
}

export const i18n = new I18nService();
