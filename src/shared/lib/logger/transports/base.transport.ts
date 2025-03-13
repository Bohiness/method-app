// src/shared/lib/logger/transports/base.transport.ts

import { LogData, LogLevel } from '../logger.types';

export interface TransportConfig {
    enabled: boolean;
    levels: LogLevel[];
}

export abstract class BaseTransport {
    protected config: TransportConfig;

    constructor(config: Partial<TransportConfig> = {}) {
        this.config = {
            enabled: true,
            levels: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'COMPONENT', 'API', 'HTTP', 'CUSTOM', 'TABLE', 'JSON', 'GROUP'],
            ...config,
        };
    }

    abstract write(data: LogData): Promise<void>;

    shouldHandle(level: LogLevel): boolean {
        return this.config.enabled && this.config.levels.includes(level);
    }

    // Геттеры для доступа к защищенным свойствам
    getConfig(): TransportConfig {
        return this.config;
    }

    isEnabled(): boolean {
        return this.config.enabled;
    }

    getLevels(): LogLevel[] {
        return this.config.levels;
    }
}
