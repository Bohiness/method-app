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
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
            }

            const fileInfo = await FileSystem.getInfoAsync(this.currentLogFile);
            if (!fileInfo.exists) {
                await FileSystem.writeAsStringAsync(this.currentLogFile, '');
            }

            await this.rotateLogsIfNeeded();

            const logEntry = this.formatLogEntry(data);

            // Проверяем текущее содержимое и добавляем новый лог в конец
            let currentContent = '';
            try {
                currentContent = await FileSystem.readAsStringAsync(this.currentLogFile);
            } catch (e) {
                // Если не удалось прочитать файл, создаем пустую строку
                currentContent = '';
            }

            await FileSystem.writeAsStringAsync(this.currentLogFile, currentContent + logEntry);
        } catch (error) {
            console.error('FileTransport write error:', error);
        }
    }

    private formatLogEntry(data: LogData): string {
        const timestamp = `[${format(new Date(data.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}]`;
        const level = `[${data.level.toUpperCase()}]`;
        const context = data.context ? `[${data.context}]` : '';
        const title = data.title ? `(${data.title})` : '';

        // Преобразуем сообщение в строку
        let message = '';
        if (typeof data.message === 'object') {
            message = JSON.stringify(data.message);
        } else {
            message = String(data.message || '');
        }

        // Формируем лог-запись с переносом строки в конце
        return `${timestamp} ${level} ${context} ${title} ${message}\n`;
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
                size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
                modificationTime:
                    fileInfo.exists && 'modificationTime' in fileInfo ? fileInfo.modificationTime : undefined,
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
