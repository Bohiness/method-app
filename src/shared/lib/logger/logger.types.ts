// src/shared/lib/logger/logger.types.ts

export type LogLevel =
    | 'DEBUG'
    | 'INFO'
    | 'WARN'
    | 'ERROR'
    | 'COMPONENT'
    | 'API'
    | 'HTTP'
    | 'CUSTOM'
    | 'TABLE'
    | 'JSON'
    | 'GROUP'
    | 'START'
    | 'FINISH';

export interface LogStyle {
    color?: string;
    background?: string;
    bold?: boolean;
    italic?: boolean;
    dim?: boolean;
    underline?: boolean;
}

export interface LogData {
    timestamp: string;
    level: LogLevel;
    message: any;
    context?: string;
    title?: string;
    meta?: Record<string, any>;
    trace?: string;
}

export interface JsonLogOptions {
    title?: string;
    context?: string;
    expanded?: boolean;
    titleStyle?: LogStyle;
    keyStyle?: LogStyle;
    stringStyle?: LogStyle;
    numberStyle?: LogStyle;
    booleanStyle?: LogStyle;
    nullStyle?: LogStyle;
}

export interface TableOptions {
    title?: string;
    titleStyle?: LogStyle;
    context?: string;
    contextStyle?: LogStyle;
    columns?: {
        header: string;
        key: string;
        width?: number;
        align?: 'left' | 'center' | 'right';
    }[];
    style?: LogStyle;
    headerStyle?: LogStyle;
    borders?: boolean;
}

export interface TransportConfig {
    enabled?: boolean;
    levels?: LogLevel[];
}

export interface StorageConfig extends TransportConfig {
    maxEntries?: number;
    key?: string;
}

export interface FileConfig extends TransportConfig {
    maxFileSize?: number;
    directory?: string;
    filename?: string;
    maxFiles?: number;
}

export interface LogstashConfig extends TransportConfig {
    host?: string;
    port?: number;
    maxRetries?: number;
    retryDelay?: number;
    batchSize?: number;
    flushInterval?: number;
}

export interface LoggerConfig {
    console?: boolean;
    storage?: StorageConfig;
    file?: FileConfig;
    logstash?: LogstashConfig;
}

export interface LoggerMethods {
    debug: (message: any, context?: string, title?: string) => void;
    info: (message: any, context?: string, title?: string) => void;
    warn: (message: any, context?: string, title?: string) => void;
    error: (message: any, context?: string, error?: Error, title?: string) => void;
    http: (message: any, context?: string, title?: string) => void;
    component: (name: string, action: string, data?: any) => void;
    api: (method: string, url: string, data?: any, response?: any) => void;
    custom: (type: string, message: any, context?: string, style?: LogStyle) => void;
    table: (data: any[], options?: TableOptions) => void;
    json: (data: any, options?: JsonLogOptions) => void;
    group: (label: string, callback: () => void) => void;
}

export interface LoggerUtils {
    getLogs: () => Promise<LogData[]>;
    clearLogs: () => Promise<void>;
    exportLogs: () => Promise<string>;
    getStats: () => Promise<{
        totalLogs: number;
        byLevel: Record<LogLevel, number>;
        storageSize: number;
        fileSize: number;
    }>;
}

export type Logger = LoggerMethods & LoggerUtils;

export interface UseLoggerOptions {
    logProps?: boolean;
    logLifecycle?: boolean;
    logRenders?: boolean;
    includeTrace?: boolean;
}

export interface ComponentLogger extends LoggerMethods {
    startGroup: (label: string) => void;
    endGroup: () => void;
    withGroup: <T>(label: string, fn: () => T) => T;
}
