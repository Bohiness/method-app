// src/shared/lib/logger/transports/storage.transport.ts

import { storage } from '@shared/lib/storage/storage.service';
import { LogData, LogLevel } from '../logger.types';
import { BaseTransport } from './base.transport';

export interface StorageTransportConfig {
    maxEntries: number;
    key: string;
    enabled: boolean;
    levels: LogLevel[];
}

export class StorageTransport extends BaseTransport {
    protected config: StorageTransportConfig;

    constructor(config: Partial<StorageTransportConfig> = {}) {
        super();
        this.config = {
            maxEntries: 1000,
            key: 'app_logs',
            enabled: true,
            levels: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'COMPONENT', 'API', 'HTTP', 'CUSTOM', 'TABLE', 'JSON', 'GROUP'],
            ...config,
        };
    }

    // Переопределяем геттер для доступа к расширенной конфигурации
    getConfig(): StorageTransportConfig {
        return this.config;
    }

    // Геттер для доступа к ключу хранилища
    getStorageKey(): string {
        return this.config.key;
    }

    async write(data: LogData): Promise<void> {
        try {
            const logs = (await storage.get<LogData[]>(this.config.key)) || [];
            logs.push(data);

            // Ограничиваем количество логов
            if (logs.length > this.config.maxEntries) {
                logs.splice(0, logs.length - this.config.maxEntries);
            }

            await storage.set(this.config.key, logs);
        } catch (error) {
            console.error('StorageTransport error:', error);
        }
    }

    async clear(): Promise<void> {
        await storage.remove(this.config.key);
    }
}
