// src/shared/ui/debug/LogViewer.tsx

import { logger } from '@shared/lib/logger/logger.service'
import { format, isToday } from 'date-fns'
import * as Haptics from 'expo-haptics'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Clipboard, ScrollView, TouchableOpacity } from 'react-native'
import { Button } from '../button'
import { Switch } from '../switch'
import { Text } from '../text'
import { TextInput } from '../text-input'
import { View } from '../view'

// Типы логов, которые мы будем использовать для фильтрации
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'COMPONENT' | 'API' | 'HTTP' | 'ALL' | 'CUSTOM' | 'START' | 'FINISH'

interface ParsedLog {
    timestamp: Date
    level: string
    context?: string
    message: string
    raw: string
}

interface LogStats {
    total: number
    byLevel: Record<string, number>
    byContext: Record<string, number>
}

// Эмодзи для разных уровней логов
const LOG_EMOJIS: Record<string, string> = {
    'DEBUG': '🐞',
    'INFO': 'ℹ️',
    'WARN': '⚠️',
    'ERROR': '❌',
    'COMPONENT': '🧩',
    'API': '🔄',
    'HTTP': '🌐',
    'CUSTOM': '📝',
    'TABLE': '📊',
    'JSON': '📄',
    'GROUP': '📂',
    'START': '▶️',
    'FINISH': '✅',
}

export function LogViewer() {
    const [logs, setLogs] = useState<string>('')
    const [parsedLogs, setParsedLogs] = useState<ParsedLog[]>([])
    const [stats, setStats] = useState<any>(null)
    const [logStats, setLogStats] = useState<LogStats>({ total: 0, byLevel: {}, byContext: {} })
    const [selectedLevel, setSelectedLevel] = useState<LogLevel>('ALL')
    const [isLoading, setIsLoading] = useState(false)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [expandedLogIndex, setExpandedLogIndex] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [showOnlyToday, setShowOnlyToday] = useState<boolean>(true)

    // Парсинг логов из текстового формата
    const parseLogContent = (content: string): ParsedLog[] => {
        if (!content) return []

        // Разбиваем текст логов на строки
        const lines = content.split('\n')
        const parsedLogs: ParsedLog[] = []

        // Регулярное выражение для парсинга логов
        // Формат: [yyyy-MM-dd HH:mm:ss.SSS] [LEVEL] [Context] Message
        const logRegex = /\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\] \[([A-Z]+)\](?:\s\[([^\]]+)\])?(.*)/

        for (const line of lines) {
            // Пропускаем пустые строки и разделители
            if (!line.trim() || line.trim().startsWith('---')) continue

            const match = line.match(logRegex)
            if (match) {
                try {
                    const timestamp = new Date(match[1])
                    const level = match[2]
                    const context = match[3]
                    // Убираем начальные пробелы из сообщения
                    const message = (match[4] || '').trim()

                    // Проверяем, что дата валидна
                    if (isNaN(timestamp.getTime())) continue

                    parsedLogs.push({
                        timestamp,
                        level,
                        context,
                        message,
                        raw: line
                    })
                } catch (e) {
                    // Пропускаем строки, которые не могут быть распарсены
                    console.error('Ошибка парсинга лога:', e)
                }
            }
        }

        // Сортируем по времени (от новых к старым)
        return parsedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    // Создаем статистику по логам
    const calculateLogStats = (logs: ParsedLog[]): LogStats => {
        const stats: LogStats = {
            total: logs.length,
            byLevel: {},
            byContext: {}
        }

        logs.forEach(log => {
            // Статистика по уровням логов
            if (log.level) {
                stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1
            }

            // Статистика по контекстам
            if (log.context) {
                stats.byContext[log.context] = (stats.byContext[log.context] || 0) + 1
            }
        })

        return stats
    }

    const loadLogs = async () => {
        try {
            setIsLoading(true)
            const content = await logger.getFileLogContent()
            const states = await logger.checkTransportsState()

            setLogs(content)
            const parsed = parseLogContent(content)
            setParsedLogs(parsed)
            setStats(states)
            setLogStats(calculateLogStats(parsed))
        } catch (error) {
            console.error('Ошибка загрузки логов:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const clearAllLogs = async () => {
        try {
            setIsLoading(true)
            await logger.clearLogs()
            await loadLogs() // Перезагружаем после очистки
        } catch (error) {
            console.error('Ошибка очистки логов:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh)
    }

    // Копирование лога в буфер обмена
    const copyLogToClipboard = async (log: ParsedLog) => {
        try {
            await Clipboard.setString(log.raw)
            Alert.alert('Скопировано!', 'Лог скопирован в буфер обмена')
            // Вибрация при копировании для тактильной обратной связи
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            } catch (error) {
                // Игнорируем ошибки вибрации
            }
        } catch (error) {
            console.error('Ошибка копирования в буфер обмена:', error)
            Alert.alert('Ошибка', 'Не удалось скопировать лог')
        }
    }

    // Копирование всех логов в буфер обмена
    const copyAllLogsToClipboard = async () => {
        try {
            await Clipboard.setString(logs)
            Alert.alert('Скопировано!', 'Все логи скопированы в буфер обмена')
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            } catch (error) {
                // Игнорируем ошибки вибрации
            }
        } catch (error) {
            console.error('Ошибка копирования в буфер обмена:', error)
            Alert.alert('Ошибка', 'Не удалось скопировать логи')
        }
    }

    // Экспорт логов
    const exportLogs = async () => {
        try {
            const jsonLogs = await logger.exportLogs()
            await Clipboard.setString(jsonLogs)
            Alert.alert('Экспорт', 'Логи экспортированы и скопированы в буфер обмена в формате JSON')
        } catch (error) {
            console.error('Ошибка экспорта логов:', error)
            Alert.alert('Ошибка', 'Не удалось экспортировать логи')
        }
    }



    // Фильтрация логов по выбранному уровню, дате и поисковому запросу
    const filteredLogs = useMemo(() => {
        return parsedLogs
            .filter(log => showOnlyToday ? isToday(log.timestamp) : true)
            .filter(log => selectedLevel === 'ALL' || log.level === selectedLevel)
            .filter(log => {
                if (!searchQuery) return true
                const query = searchQuery.toLowerCase()
                return (
                    log.message.toLowerCase().includes(query) ||
                    (log.context?.toLowerCase().includes(query) || false)
                )
            })
    }, [parsedLogs, selectedLevel, searchQuery, showOnlyToday])

    // Переключение состояния развернутого лога
    const toggleLogExpand = (index: number) => {
        setExpandedLogIndex(expandedLogIndex === index ? null : index)
    }

    // Функция для получения цвета фона по уровню лога
    const getLogBgColor = (level: string): string => {
        switch (level) {
            case 'DEBUG': return 'bg-surface-paper dark:bg-surface-paper-dark'
            case 'INFO': return 'bg-surface-paper dark:bg-surface-paper-dark'
            case 'WARN': return 'bg-surface-paper dark:bg-surface-paper-dark'
            case 'ERROR': return 'bg-surface-paper dark:bg-surface-paper-dark'
            case 'COMPONENT': return 'bg-surface-paper dark:bg-surface-paper-dark'
            case 'API': return 'bg-surface-paper dark:bg-surface-paper-dark'
            case 'HTTP': return 'bg-surface-paper dark:bg-surface-paper-dark'
            case 'START': return 'bg-surface-paper dark:bg-surface-paper-dark'
            case 'FINISH': return 'bg-surface-paper dark:bg-surface-paper-dark'
            default: return 'bg-surface-paper dark:bg-surface-paper-dark'
        }
    }

    useEffect(() => {
        loadLogs()

        let interval: NodeJS.Timeout | null = null

        if (autoRefresh) {
            interval = setInterval(loadLogs, 5000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [autoRefresh])

    // Уровни логов для переключения
    const logLevels: LogLevel[] = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'COMPONENT', 'API', 'HTTP', 'START', 'FINISH']

    return (
        <View className="flex-1 gap-y-6">
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row">
                    <Button
                        onPress={loadLogs}
                        className="mr-2"
                        size='sm'
                    >
                        Обновить
                    </Button>
                    <Button
                        onPress={copyAllLogsToClipboard}
                        className="mr-2"
                        size='sm'
                    >
                        Копировать
                    </Button>
                    <Button
                        onPress={exportLogs}
                        className="mr-2"
                        size='sm'
                    >
                        Экспорт JSON
                    </Button>
                    <Button
                        onPress={clearAllLogs}
                        size='sm'
                        className="bg-error"
                    >
                        Очистить
                    </Button>
                </View>
            </View>

            {/* Блок со статистикой */}
            <View variant='paper' className="rounded-md">
                <Text weight='bold' size='sm'>Статистика логов</Text>
                <View className="flex-row flex-wrap mb-2">
                    <View variant='stone' className="py-2 m-1 rounded-md">
                        <Text size='xs' weight='bold'>Всего логов: {logStats.total}</Text>
                    </View>

                    {Object.entries(logStats.byLevel).map(([level, count]) => (
                        <TouchableOpacity
                            key={level}
                            onPress={() => setSelectedLevel(level as LogLevel)}
                            className="bg-surface-stone dark:bg-surface-stone-dark px-3 py-2 m-1 rounded-md"
                        >
                            <Text size='xs' weight='bold'>{LOG_EMOJIS[level] || ''} {level}: {count}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="flex-row flex-wrap p-2">
                    {logLevels.map(level => (
                        <TouchableOpacity
                            key={level}
                            onPress={() => setSelectedLevel(level)}
                            className={`px-3 py-1 m-1 rounded-full ${selectedLevel === level ? 'bg-tint dark:bg-tint-dark' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                        >
                            <Text size='xs' weight='medium' className={`${selectedLevel === level ? 'text-background dark:text-background-dark' : 'text-text dark:text-text-dark  '}`}>
                                {LOG_EMOJIS[level] || ''} {level} {logStats.byLevel[level] ? `(${logStats.byLevel[level]})` : ''}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>



                <Text weight='bold' size='xs' className="mb-1">По контексту:</Text>
                <View className="flex-row flex-wrap">
                    {Object.entries(logStats.byContext)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([context, count]) => (
                            <View key={context} variant='stone' className="px-3 py-2 m-1 rounded-md">
                                <Text size='xs'>{context}: {count}</Text>
                            </View>
                        ))
                    }
                </View>


                <View className="flex-row justify-between items-center mb-2">
                    <Text size='sm'>Автообновление каждые 5 секунд:</Text>
                    <Switch
                        checked={autoRefresh}
                        onChange={toggleAutoRefresh}
                        value={autoRefresh ? 'on' : 'off'}
                    />
                </View>

                <View className="flex-row justify-between items-center mb-2">
                    <Text size='sm'>Показывать логи только за сегодня:</Text>
                    <Switch
                        checked={showOnlyToday}
                        onChange={() => setShowOnlyToday(!showOnlyToday)}
                        value={showOnlyToday ? 'on' : 'off'}
                    />
                </View>

            </View>

            <ScrollView className="flex-1">
                {isLoading && (
                    <View variant='paper' className="absolute inset-0 items-center justify-center bg-text dark:bg-text-dark bg-opacity-20 z-10">
                        <ActivityIndicator size="large" color="#007CCB" />
                    </View>
                )}

                <View className="flex-row justify-between items-center">
                    <Text weight='bold' size='lg'>
                        {showOnlyToday ? 'Логи за сегодня' : 'Все логи'} ({filteredLogs.length})
                    </Text>
                </View>

                {/* {stats && (
                    <View className="mb-4 p-3 bg-surface-paper rounded-md">
                        <Text className="font-bold mb-2">Состояние транспортов:</Text>
                        <Text className="font-mono text-xs">
                            {JSON.stringify(stats, null, 2)}
                        </Text>
                    </View>
                )} */}

                {/* Поле поиска */}
                <View className="mb-2 mt-2">
                    <TextInput
                        placeholder="Поиск в логах..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="px-3 py-2"
                        variant='underline'
                    />
                </View>

                {filteredLogs.length === 0 ? (
                    <View className="items-center justify-center">
                        <Text variant='secondary'>Нет логов за сегодня</Text>
                    </View>
                ) : (
                    filteredLogs.map((log, index) => {
                        // Определяем tailwind классы для каждого уровня лога
                        let borderColorClass = 'border-l-inactive'
                        let textColorClass = 'text-text'

                        switch (log.level) {
                            case 'DEBUG':
                                borderColorClass = 'border-l-secondary-light'
                                textColorClass = 'text-secondary-light dark:text-secondary-light-dark'
                                break
                            case 'INFO':
                                borderColorClass = 'border-l-tint'
                                textColorClass = 'text-tint dark:text-tint-dark'
                                break
                            case 'WARN':
                                borderColorClass = 'border-l-warning'
                                textColorClass = 'text-warning dark:text-warning-dark'
                                break
                            case 'ERROR':
                                borderColorClass = 'border-l-error'
                                textColorClass = 'text-error dark:text-error-dark'
                                break
                            case 'COMPONENT':
                                borderColorClass = 'border-l-tint'
                                textColorClass = 'text-tint dark:text-tint-dark'
                                break
                            case 'API':
                                borderColorClass = 'border-l-success'
                                textColorClass = 'text-success dark:text-success-dark'
                                break
                            case 'HTTP':
                                borderColorClass = 'border-l-success'
                                textColorClass = 'text-success dark:text-success-dark'
                                break
                            case 'START':
                                borderColorClass = 'border-l-tint'
                                textColorClass = 'text-tint dark:text-tint-dark'
                                break
                            case 'FINISH':
                                borderColorClass = 'border-l-success'
                                textColorClass = 'text-success dark:text-success-dark'
                                break
                        }

                        const isExpanded = expandedLogIndex === index
                        const bgColorClass = getLogBgColor(log.level)

                        return (
                            <TouchableOpacity
                                key={index}
                                className={`mb-2 p-2 border-l-4 ${borderColorClass} ${bgColorClass} rounded-sm gap-y-2`}
                                onPress={() => toggleLogExpand(index)}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row justify-between">
                                    <Text variant='secondary' className="text-xs">
                                        {format(log.timestamp, 'HH:mm:ss.SSS')}
                                    </Text>
                                    <View className="flex-row">
                                        {log.context && (
                                            <Text variant='secondary' className="text-xs font-medium ml-2">
                                                [{log.context}]
                                            </Text>
                                        )}
                                        <Text className={`text-xs font-bold ml-2 ${textColorClass}`}>
                                            {LOG_EMOJIS[log.level] || ''} {log.level}
                                        </Text>
                                    </View>
                                </View>

                                {/* Сообщение лога - показываем в сокращенном или полном виде */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="font-mono text-xs mt-1" variant='default' numberOfLines={isExpanded ? 0 : 2}>
                                        {log.message}
                                    </Text>
                                </View>

                                {/* Расширенный вид лога */}
                                <View variant='stone' className="border-t">
                                    <Text weight='bold' size='xs' className="pt-2 pb-2" variant='default'>Полный лог:</Text>
                                    <Text className="font-mono" size='xs' variant='default'>{log.raw}</Text>

                                    <View className="flex-row justify-end">
                                        <View className="px-3 py-2 rounded-md mr-2" >
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation()
                                                    copyLogToClipboard(log)
                                                }}
                                            >
                                                <Text className="text-xs text-tint">Копировать</Text>
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                )}
            </ScrollView>
        </View>
    )
}
