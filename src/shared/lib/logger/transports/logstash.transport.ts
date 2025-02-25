// src/shared/lib/logger/transports/logstash.transport.ts

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { LogData, LogLevel } from '../logger.types';
import { BaseTransport } from './base.transport';

export interface LogstashConfig {
    host: string;
    port: number;
    maxRetries: number;
    retryDelay: number;
    batchSize: number;
    flushInterval: number;
    enabled: boolean;
    levels: LogLevel[];
}

export class LogstashTransport extends BaseTransport {
    protected config: LogstashConfig;
    private queue: LogData[] = [];
    private timer?: NodeJS.Timeout;
    private retryCount = 0;

    constructor(config: Partial<LogstashConfig> = {}) {
        super();
        this.config = {
            host: process.env.EXPO_PUBLIC_LOGSTASH_HOST || '192.168.0.243',
            port: Number(process.env.EXPO_PUBLIC_LOGSTASH_PORT) || 5044,
            maxRetries: 3,
            retryDelay: 5000,
            batchSize: 100,
            flushInterval: 5000,
            enabled: true,
            levels: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'COMPONENT', 'API', 'HTTP', 'CUSTOM', 'TABLE', 'JSON', 'GROUP'],
            ...config,
        };

        this.startTimer();
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

            const response = await fetch(`http://${this.config.host}:${this.config.port}`, {
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

        const batch = this.queue.splice(0, this.config.batchSize);
        await this.send(batch);
    }

    async write(data: LogData): Promise<void> {
        this.queue.push(data);

        if (this.queue.length >= this.config.batchSize) {
            await this.flush();
        }
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}
