// src/shared/lib/logger/transports/file.transport.ts

import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import { LogData, LogLevel } from '../logger.types';
import { BaseTransport } from './base.transport';

export interface FileTransportConfig {
    enabled: boolean;
    levels: LogLevel[];
    maxFileSize: number;
    directory: string;
    filename: string;
}

export class FileTransport extends BaseTransport {
    protected config: FileTransportConfig;
    protected currentLogFile: string;

    constructor(config: Partial<FileTransportConfig> = {}) {
        super();
        this.config = {
            enabled: true,
            levels: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'COMPONENT', 'API', 'HTTP', 'CUSTOM', 'TABLE', 'JSON', 'GROUP'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            directory: 'logs',
            filename: 'app.log',
            ...config,
        };

        this.currentLogFile = this.getLogFilePath();
        this.initialize();
    }

    private getLogFilePath(): string {
        return `${FileSystem.documentDirectory}${this.config.directory}/${this.config.filename}`;
    }

    private async initialize(): Promise<void> {
        try {
            const dirPath = `${FileSystem.documentDirectory}${this.config.directory}`;
            const dirInfo = await FileSystem.getInfoAsync(dirPath);

            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
            }

            // Проверяем существование файла лога
            const fileInfo = await FileSystem.getInfoAsync(this.currentLogFile);
            if (!fileInfo.exists) {
                await FileSystem.writeAsStringAsync(this.currentLogFile, '');
            }
        } catch (error) {
            console.error('FileTransport initialization error:', error);
        }
    }

    private async rotateLogsIfNeeded(): Promise<void> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(this.currentLogFile);

            if (fileInfo.exists && fileInfo.size >= this.config.maxFileSize) {
                const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
                const newPath = this.currentLogFile.replace('.log', `-${timestamp}.log`);

                await FileSystem.moveAsync({
                    from: this.currentLogFile,
                    to: newPath,
                });
            }
        } catch (error) {
            console.error('FileTransport rotation error:', error);
        }
    }

    async write(data: LogData): Promise<void> {
        try {
            // Проверяем существование директории и файла
            const dirPath = `${FileSystem.documentDirectory}${this.config.directory}`;
            const dirInfo = await FileSystem.getInfoAsync(dirPath);
            const fileInfo = await FileSystem.getInfoAsync(this.currentLogFile);

            await this.rotateLogsIfNeeded();

            const logEntry = this.formatLogEntry(data);

            // Добавляем разделитель для лучшей читаемости
            const separator = '-'.repeat(80) + '\n';

            await FileSystem.writeAsStringAsync(this.currentLogFile, logEntry + separator, {
                encoding: FileSystem.EncodingType.UTF8,
                append: true,
            });

            // Проверяем что запись прошла успешно
            const content = await this.getLogFileContent();
        } catch (error) {
            console.error('FileTransport write error:', error);
        }
    }

    private formatLogEntry(data: LogData): string {
        return [
            `[${format(new Date(data.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}]`,
            `[${data.level.toUpperCase()}]`,
            data.context ? `[${data.context}]` : '',
            data.title ? `(${data.title})` : '',
            typeof data.message === 'object' ? '\n' + JSON.stringify(data.message, null, 2) : data.message,
            '\n',
        ]
            .filter(Boolean)
            .join(' ');
    }

    async getLogFileContent(): Promise<string> {
        try {
            const exists = await FileSystem.getInfoAsync(this.currentLogFile);
            if (!exists.exists) {
                return '';
            }
            return await FileSystem.readAsStringAsync(this.currentLogFile);
        } catch (error) {
            console.error('FileTransport read error:', error);
            return '';
        }
    }

    async getStats(): Promise<{
        exists: boolean;
        size: number;
        modificationTime: number | undefined;
        content: string;
    }> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(this.currentLogFile);
            const content = fileInfo.exists ? await FileSystem.readAsStringAsync(this.currentLogFile) : '';

            return {
                exists: fileInfo.exists,
                size: fileInfo.size || 0,
                modificationTime: fileInfo.modificationTime,
                content,
            };
        } catch (error) {
            console.error('FileTransport getStats error:', error);
            return {
                exists: false,
                size: 0,
                modificationTime: undefined,
                content: '',
            };
        }
    }

    async clear(): Promise<void> {
        try {
            await FileSystem.deleteAsync(this.currentLogFile);
        } catch (error) {
            console.error('FileTransport clear error:', error);
        }
    }
}
