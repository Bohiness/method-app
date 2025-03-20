// src/shared/lib/logger/logger.colors.ts

import { LogLevel } from './logger.types';

export const LogColors = {
    // Базовые цвета ANSI для консоли React Native
    reset: '\x1B[0m',
    bright: '\x1B[1m',
    dim: '\x1B[2m',
    italic: '\x1B[3m',
    underscore: '\x1B[4m',

    // Цвета текста
    black: '\x1B[30m',
    red: '\x1B[31m',
    green: '\x1B[32m',
    yellow: '\x1B[33m',
    blue: '\x1B[34m',
    magenta: '\x1B[35m',
    cyan: '\x1B[36m',
    white: '\x1B[37m',

    // Яркие цвета
    blackBright: '\x1B[90m',
    redBright: '\x1B[91m',
    greenBright: '\x1B[92m',
    yellowBright: '\x1B[93m',
    blueBright: '\x1B[94m',
    magentaBright: '\x1B[95m',
    cyanBright: '\x1B[96m',
    whiteBright: '\x1B[97m',
};

// Цвета для разных уровней логов
export const LOG_COLORS: Record<LogLevel, string> = {
    DEBUG: '34', // Синий
    INFO: '32', // Зеленый
    WARN: '33', // Желтый
    ERROR: '31', // Красный
    COMPONENT: '36', // Голубой
    API: '35', // Пурпурный
    HTTP: '90', // Серый
    CUSTOM: '37', // Белый
    TABLE: '37', // Белый
    JSON: '37', // Белый
    GROUP: '37', // Белый
    START: '92', // Яркий зеленый
    FINISH: '92', // Яркий зеленый
};

// Маркеры для разных уровней логов
export const LOG_MARKERS: Record<LogLevel, string> = {
    DEBUG: '🐞',
    INFO: 'ℹ️',
    WARN: '⚠️',
    ERROR: '❌',
    COMPONENT: '🧩',
    API: '🔄',
    HTTP: '🌐',
    CUSTOM: '📝',
    TABLE: '📊',
    JSON: '📄',
    GROUP: '📂',
    START: '▶️',
    FINISH: '✅',
};
