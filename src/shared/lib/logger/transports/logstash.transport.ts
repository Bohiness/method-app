// src/shared/lib/logger/transports/logstash.transport.ts

import { networkService } from '@shared/lib/network/network.service';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { LogData, LogLevel } from '../logger.types';
import { BaseTransport } from './base.transport';

export interface LogstashConfig {
    maxRetries: number;
    retryDelay: number;
    batchSize: number;
    flushInterval: number;
    enabled: boolean;
    levels: LogLevel[];
    url: string;
}

export class LogstashTransport extends BaseTransport {
    protected config: LogstashConfig;
    private queue: LogData[] = [];
    private timer?: NodeJS.Timeout;
    private retryCount = 0;
    private networkListener: (() => void) | null = null;

    constructor(config: Partial<LogstashConfig> = {}) {
        super();
        this.config = {
            maxRetries: 3,
            retryDelay: 5000,
            batchSize: 100,
            flushInterval: 5000,
            enabled: true,
            levels: ['ERROR', 'WARN'],
            url: 'https://api.method.do/logs/api/add/',
            ...config,
        };

        // Добавляем слушателя сети для автоматической отправки логов при восстановлении соединения
        this.networkListener = networkService.addListener(isConnected => {
            if (isConnected && this.queue.length > 0) {
                this.flush().catch(err => console.error('Failed to flush logs on network reconnect:', err));
            }
        });

        this.startTimer();
    }

    // Переопределяем shouldHandle для проверки соединения
    shouldHandle(level: LogLevel): boolean {
        return super.shouldHandle(level) && networkService.getConnectionStatus();
    }

    private startTimer() {
        this.timer = setInterval(() => this.flush(), this.config.flushInterval);
    }
    private formatErrorMessage(error: any): string {
        if (typeof error === 'string') return error;

        if (error instanceof Error) {
            return `${error.name}: ${error.message}${error.stack ? '\n' + error.stack : ''}`;
        }

        if (typeof error === 'object') {
            return JSON.stringify(error);
        }

        return String(error);
    }

    private async send(logs: LogData[]): Promise<void> {
        // Проверяем соединение перед отправкой
        if (!networkService.getConnectionStatus()) {
            console.log('Network is offline, queuing logs for later');
            return;
        }

        try {
            const formattedLogs = logs.map(log => ({
                ...log,
                message: typeof log.message === 'object' ? this.formatErrorMessage(log.message) : log.message,
                timestamp: log.timestamp || new Date().toISOString(),
                context: log.context || 'app',
            }));

            const payload = {
                timestamp: new Date().toISOString(),
                logs: formattedLogs,
                metadata: {
                    app: Constants.expoConfig?.name || 'unknown',
                    version: Constants.expoVersion || 'unknown',
                    platform: Platform.OS,
                    environment: __DEV__ ? 'development' : 'production',
                },
            };

            const response = await fetch(this.config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to send logs to Logstash:', error);
        }
    }

    private async flush(): Promise<void> {
        if (this.queue.length === 0) return;

        // Если нет соединения, сохраняем логи в очереди
        if (!networkService.getConnectionStatus()) {
            console.log('Network is offline, skipping log flush');
            return;
        }

        const batch = this.queue.splice(0, this.config.batchSize);
        await this.send(batch);
    }

    async write(data: LogData): Promise<void> {
        if (!this.config.levels.includes(data.level)) {
            return;
        }

        this.queue.push(data);

        if (this.queue.length >= this.config.batchSize && networkService.getConnectionStatus()) {
            await this.flush();
        }
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        // Удаляем слушателя сети при уничтожении транспорта
        if (this.networkListener) {
            networkService.removeListener(this.networkListener);
            this.networkListener = null;
        }
    }
}
