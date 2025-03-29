// src/shared/lib/logger/logger.service.ts

import { format } from 'date-fns';
import { storage } from '../storage/storage.service';
import { LOG_COLORS, LOG_MARKERS } from './logger.colors';
import { JsonLogOptions, LogData, LogLevel, LogStyle, TableOptions } from './logger.types';
import { BaseTransport } from './transports/base.transport';
import { FileTransport } from './transports/file.transport';
import { LogstashTransport } from './transports/logstash.transport';
import { StorageTransport } from './transports/storage.transport';

class Logger {
    private transports: BaseTransport[] = [];
    private groupDepth: number = 0;
    private enabledLevels: LogLevel[] = [
        'DEBUG',
        'INFO',
        'WARN',
        'ERROR',
        'COMPONENT',
        'API',
        'HTTP',
        'CUSTOM',
        'TABLE',
        'JSON',
        'GROUP',
        'START',
        'FINISH',
    ];
    private includeTimestamp: boolean = true;

    constructor() {
        // Инициализируем транспорты
        this.transports = [new StorageTransport(), new FileTransport(), new LogstashTransport()];
    }

    /**
     * Получить содержимое лог-файла
     */
    async getFileLogContent(): Promise<string> {
        const fileTransport = this.transports.find(t => t instanceof FileTransport) as FileTransport;

        return fileTransport ? await fileTransport.getLogFileContent() : '';
    }

    /**
     * Проверить состояние всех транспортов
     */
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

    /**
     * Включить или отключить определенные уровни логов
     */
    setEnabledLevels(levels: LogLevel[]): void {
        this.enabledLevels = levels;
    }

    /**
     * Включить или отключить все логи
     */
    setLoggingEnabled(enabled: boolean): void {
        for (const transport of this.transports) {
            const config = transport.getConfig();
            config.enabled = enabled;
        }
    }

    /**
     * Включить или отключить отображение временных меток
     */
    setTimestampEnabled(enabled: boolean): void {
        this.includeTimestamp = enabled;
    }

    /**
     * Записать лог с определенным уровнем, контекстом и дополнительной информацией
     */
    private async writeToTransports(data: LogData) {
        // Если уровень лога не в списке включенных, не записываем
        if (!this.enabledLevels.includes(data.level)) {
            return;
        }

        await Promise.all(
            this.transports
                .filter(transport => transport.shouldHandle(data.level))
                .map(transport => transport.write(data))
        );
    }

    /**
     * Применить стиль к тексту для вывода в консоль
     */
    private applyStyle(text: string, style?: LogStyle): string {
        if (!style) return text;

        let result = text;
        if (style.color) result = `\x1b[${style.color}m${result}`;
        if (style.bold) result = `\x1b[1m${result}`;
        if (style.dim) result = `\x1b[2m${result}`;
        return `${result}\x1b[0m`;
    }

    /**
     * Форматировать заголовок сообщения лога
     */
    private formatLogMessage(level: LogLevel, message: any, context?: string, title?: string): string {
        // Пробелы для отступа в соответствии с глубиной группы
        const indent = this.groupDepth > 0 ? '  '.repeat(this.groupDepth) : '';

        // Части заголовка лога
        const parts: string[] = [];

        // Временная метка
        if (this.includeTimestamp) {
            parts.push(this.applyStyle(format(new Date(), 'HH:mm:ss.SSS'), { dim: true }));
        }

        // Маркер и уровень лога
        const marker = LOG_MARKERS[level] || '';
        const levelColor = LOG_COLORS[level] || '37';
        parts.push(this.applyStyle(`${marker} ${level.padEnd(7)}`, { color: levelColor }));

        // Контекст
        if (context) {
            parts.push(this.applyStyle(`[${context}]`, { color: '90' }));
        }

        // Заголовок
        if (title) {
            parts.push(this.applyStyle(`(${title})`, { dim: true }));
        }

        return indent + parts.join(' ');
    }

    /**
     * Записать сообщение в лог с определенным уровнем
     */
    private async logMessage(
        level: LogLevel,
        message: any,
        context?: string,
        title?: string,
        meta?: Record<string, any>
    ) {
        // Если уровень лога не в списке включенных, не логируем
        if (!this.enabledLevels.includes(level)) {
            return;
        }

        const timestamp = new Date().toISOString();
        const logData: LogData = {
            timestamp,
            level,
            message,
            context,
            title,
            meta,
        };

        // Формируем заголовок лога
        const header = this.formatLogMessage(level, message, context, title);

        // Выводим в консоль одной строкой
        if (typeof message === 'object') {
            console.log(header);
            console.dir(message, { depth: null, colors: true });
        } else {
            // Для текстовых сообщений объединяем заголовок и сообщение в одну строку
            console.log(`${header} ${message}`);
        }

        // Отправляем в транспорты
        await this.writeToTransports(logData);

        return timestamp; // Возвращаем временную метку для использования в потенциальных замерах времени
    }

    /**
     * Записать начало операции
     */
    start(message: any, context?: string, title?: string) {
        if (typeof message === 'object') {
            return this.logMessage('START', JSON.stringify(message), context, title, { originalData: message });
        }
        return this.logMessage('START', message, context, title);
    }

    /**
     * Записать завершение операции
     */
    finish(message: any, context?: string, title?: string) {
        if (typeof message === 'object') {
            return this.logMessage('FINISH', JSON.stringify(message), context, title, { originalData: message });
        }
        return this.logMessage('FINISH', message, context, title);
    }

    /**
     * Записать информацию
     */
    log(message: any, context?: string, title?: string) {
        if (typeof message === 'object') {
            return this.logMessage('INFO', JSON.stringify(message), context, title, { originalData: message });
        }
        return this.logMessage('INFO', message, context, title);
    }

    /**
     * Записать информацию (псевдоним для log)
     */
    info(message: any, context?: string, title?: string) {
        if (typeof message === 'object') {
            return this.logMessage('INFO', JSON.stringify(message), context, title, { originalData: message });
        }
        return this.logMessage('INFO', message, context, title);
    }

    /**
     * Записать отладочную информацию
     */
    debug(message: any, context?: string, title?: string) {
        if (typeof message === 'object') {
            return this.logMessage('DEBUG', JSON.stringify(message), context, title, { originalData: message });
        }
        return this.logMessage('DEBUG', message, context, title);
    }

    /**
     * Записать предупреждение
     */
    warn(message: any, context?: string, title?: string) {
        if (typeof message === 'object') {
            return this.logMessage('WARN', JSON.stringify(message), context, title, { originalData: message });
        }
        return this.logMessage('WARN', message, context, title);
    }

    /**
     * Записать ошибку
     */
    error(messageOrError: string | Error | any, context?: string, title?: string) {
        let errorMessage: string;
        let errorInfo: { name?: string; message?: string; stack?: string } | undefined;
        let originalData: any = undefined;

        if (messageOrError instanceof Error) {
            // Если передана ошибка как первый аргумент
            errorInfo = {
                name: messageOrError.name,
                message: messageOrError.message,
                stack: messageOrError.stack,
            };
            errorMessage = `${errorInfo.name}: ${errorInfo.message}`;
        } else if (typeof messageOrError === 'object') {
            // Если передан объект, но не Error
            errorMessage = JSON.stringify(messageOrError);
            originalData = messageOrError;
        } else {
            // Если передана строка или другой примитив
            errorMessage = String(messageOrError);
        }

        return this.logMessage('ERROR', errorMessage, context, title, {
            error: errorInfo,
            originalData: originalData,
        });
    }

    /**
     * Записать таблицу данных
     */
    table(data: any[], options: TableOptions = {}) {
        const { title, context } = options;

        if (title || context) {
            const header = this.formatLogMessage('TABLE', '', context, title);
            console.log(header);
        }

        console.table(data);

        // Возвращаем только сообщение о типе данных, чтобы не дублировать большие объекты
        return this.logMessage('TABLE', `Табличные данные (${data.length} строк)`, context, title, { tableData: data });
    }

    /**
     * Записать JSON-данные
     * @param data - Данные для записи
     * @param options - Опции лога
     * @returns Временная метка лога
     */
    json(data: any, options: JsonLogOptions = {}) {
        const { title, context } = options;

        if (title || context) {
            const header = this.formatLogMessage('JSON', '', context, title);
            console.log(header);
        }

        console.dir(data, { depth: null, colors: true });

        // Возвращаем только метаданные, чтобы не дублировать большие объекты
        return this.logMessage('JSON', `JSON данные`, context, title, { jsonData: data });
    }

    /**
     * Начать группу логов
     */
    startGroup(label: string) {
        console.group(this.applyStyle(label, { bold: true }));
        this.groupDepth++;
        return this.logMessage('GROUP', `Начало группы: ${label}`, 'Logger');
    }

    /**
     * Завершить группу логов
     */
    endGroup() {
        console.groupEnd();
        this.groupDepth = Math.max(0, this.groupDepth - 1);
        return this.logMessage('GROUP', `Конец группы`, 'Logger');
    }

    /**
     * Выполнить функцию внутри группы логов
     */
    group(label: string, callback: () => void) {
        this.startGroup(label);
        callback();
        this.endGroup();
    }

    /**
     * Асинхронная группа логов
     */
    async asyncGroup<T>(label: string, callback: () => Promise<T>): Promise<T> {
        this.startGroup(label);
        try {
            const result = await callback();
            return result;
        } finally {
            this.endGroup();
        }
    }

    /**
     * Измерить время выполнения функции
     */
    async time<T>(label: string, callback: () => Promise<T>, context?: string): Promise<T> {
        const startTime = performance.now();
        const startTimestamp = await this.logMessage('DEBUG', `⏱️ Начало: ${label}`, context || 'Timer');

        try {
            const result = await callback();
            const endTime = performance.now();
            await this.logMessage(
                'DEBUG',
                `⏱️ Конец: ${label} (${(endTime - startTime).toFixed(2)}ms)`,
                context || 'Timer'
            );
            return result;
        } catch (error) {
            const endTime = performance.now();
            await this.logMessage(
                'ERROR',
                `⏱️ Ошибка: ${label} (${(endTime - startTime).toFixed(2)}ms)`,
                context || 'Timer'
            );
            throw error;
        }
    }

    /**
     * Записать лог о компоненте
     */
    component(name: string, action: string, data?: any) {
        const message = typeof data === 'object' ? action : `${action} ${data || ''}`.trim();

        return this.logMessage('COMPONENT', message, name, undefined, { data });
    }

    /**
     * Записать лог о запросе API
     */
    api(method: string, url: string, data?: any, response?: any) {
        const message = `${method} ${url}`;
        return this.logMessage('API', message, 'API', undefined, { data, response });
    }

    /**
     * Записать HTTP-запрос
     */
    http(method: string, url: string, statusCode?: number, duration?: number) {
        const statusColor = !statusCode
            ? ''
            : statusCode < 300
            ? '32' // Зеленый для успешных запросов
            : statusCode < 400
            ? '33' // Желтый для редиректов
            : '31'; // Красный для ошибок

        const statusText = statusCode ? this.applyStyle(`${statusCode}`, { color: statusColor }) : '';
        const durationText = duration ? `${duration.toFixed(0)}ms` : '';

        return this.logMessage('HTTP', `${method} ${url} ${statusText} ${durationText}`, 'HTTP');
    }

    /**
     * Получить логи из хранилища
     */
    async getLogs(): Promise<LogData[]> {
        const storageTransport = this.transports.find(t => t instanceof StorageTransport) as StorageTransport;

        return (await storage.get<LogData[]>(storageTransport.getStorageKey())) || [];
    }

    /**
     * Очистить все логи
     */
    async clearLogs(): Promise<void> {
        await Promise.all(this.transports.filter(t => 'clear' in t).map(t => (t as any).clear()));
    }

    /**
     * Экспортировать логи в JSON
     */
    async exportLogs(): Promise<string> {
        const logs = await this.getLogs();
        return JSON.stringify(logs, null, 2);
    }

    /**
     * Проверить состояние всех транспортов
     */
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
