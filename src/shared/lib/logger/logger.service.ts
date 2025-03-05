// src/shared/lib/logger/logger.service.ts

import { format } from 'date-fns';
import { storage } from '../storage/storage.service';
import { JsonLogOptions, LogData, LogLevel, LogStyle, TableOptions } from './logger.types';
import { BaseTransport } from './transports/base.transport';
import { FileTransport } from './transports/file.transport';
import { LogstashTransport } from './transports/logstash.transport';
import { StorageTransport } from './transports/storage.transport';

class Logger {
    private transports: BaseTransport[] = [];

    constructor() {
        // Инициализируем транспорты
        this.transports = [new StorageTransport(), new FileTransport(), new LogstashTransport()];
    }

    async getFileLogContent(): Promise<string> {
        const fileTransport = this.transports.find(t => t instanceof FileTransport) as FileTransport;

        return fileTransport ? await fileTransport.getLogFileContent() : '';
    }

    async checkTransports(): Promise<void> {
        for (const transport of this.transports) {
            try {
                await transport.write({
                    timestamp: new Date().toISOString(),
                    level: 'DEBUG',
                    message: 'Transport check',
                    context: 'Logger',
                });
                console.log(`Transport ${transport.constructor.name} check passed`);
            } catch (error) {
                console.error(`Transport ${transport.constructor.name} check failed:`, error);
            }
        }
    }

    private async writeToTransports(data: LogData) {
        await Promise.all(
            this.transports
                .filter(transport => transport.shouldHandle(data.level))
                .map(transport => transport.write(data))
        );
    }

    private applyStyle(text: string, style?: LogStyle): string {
        if (!style) return text;

        let result = text;
        if (style.color) result = `\x1b[${style.color}m${result}`;
        if (style.bold) result = `\x1b[1m${result}`;
        if (style.dim) result = `\x1b[2m${result}`;
        return `${result}\x1b[0m`;
    }

    private formatLogMessage(type: string, message: any, context?: string, title?: string): string {
        const timestamp = format(new Date(), 'HH:mm:ss');
        const parts = [this.applyStyle(timestamp, { dim: true }), this.applyStyle(type.padEnd(7), { color: '36' })];

        if (context) {
            parts.push(this.applyStyle(`[${context}]`, { color: '90' }));
        }

        if (title) {
            parts.push(this.applyStyle(`(${title})`, { dim: true }));
        }

        return parts.join(' ');
    }

    private async logMessage(level: LogLevel, message: any, context?: string, title?: string) {
        const logData: LogData = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            title,
        };

        // Выводим в консоль
        const header = this.formatLogMessage(level, message, context, title);
        console.log(header);

        if (typeof message === 'object') {
            console.dir(message, { depth: null, colors: true });
        } else {
            console.log(message);
        }

        // Отправляем в транспорты
        await this.writeToTransports(logData);
    }

    log(message: any, context?: string, title?: string) {
        this.logMessage('INFO', message, context, title);
    }

    debug(message: any, context?: string, title?: string) {
        this.logMessage('DEBUG', message, context, title);
    }

    warn(message: any, context?: string, title?: string) {
        this.logMessage('WARN', message, context, title);
    }

    error(message: any, error?: any, context?: string, title?: string) {
        this.logMessage(
            'ERROR',
            {
                message,
                error: error
                    ? {
                          name: error.name,
                          message: error.message,
                          stack: error.stack,
                      }
                    : undefined,
            },
            context,
            title
        );
    }

    table(data: any[], options: TableOptions = {}) {
        const { title, context } = options;

        if (title || context) {
            const header = this.formatLogMessage('TABLE', '', context, title);
            console.log(header);
        }

        console.table(data);
    }

    json(data: any, options: JsonLogOptions = {}) {
        const { title, context } = options;

        if (title || context) {
            const header = this.formatLogMessage('JSON', '', context, title);
            console.log(header);
        }

        console.dir(data, { depth: null, colors: true });
    }

    group(label: string, callback: () => void) {
        console.group(this.applyStyle(label, { bold: true }));
        callback();
        console.groupEnd();
    }

    component(name: string, action: string, data?: any) {
        this.logMessage('COMPONENT', { action, data }, name);
    }

    api(method: string, url: string, data?: any, response?: any) {
        this.logMessage('API', { method, url, data, response }, 'API');
    }

    async getLogs(): Promise<LogData[]> {
        const storageTransport = this.transports.find(t => t instanceof StorageTransport) as StorageTransport;

        return (await storage.get<LogData[]>(storageTransport.getStorageKey())) || [];
    }

    async clearLogs(): Promise<void> {
        await Promise.all(this.transports.filter(t => 'clear' in t).map(t => (t as any).clear()));
    }

    async exportLogs(): Promise<string> {
        const logs = await this.getLogs();
        return JSON.stringify(logs, null, 2);
    }

    async checkTransportsState(): Promise<Record<string, any>> {
        const states: Record<string, any> = {};

        for (const transport of this.transports) {
            try {
                if (transport instanceof FileTransport) {
                    states.file = await transport.getStats();
                }
                // Добавьте проверки для других транспортов если нужно

                states[transport.constructor.name] = {
                    enabled: transport.isEnabled(),
                    levels: transport.getLevels(),
                };
            } catch (error: unknown) {
                states[transport.constructor.name] = { error: error instanceof Error ? error.message : String(error) };
            }
        }

        return states;
    }
}

export const logger = new Logger();
