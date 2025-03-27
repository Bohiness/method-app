import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { apiClient } from '@shared/config/api-client'
import { API_ROUTES } from '@shared/constants/system/api-routes'
import { useUser } from '@shared/context/user-provider'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { logger } from '@shared/lib/logger/logger.service'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import { isToday } from 'date-fns'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, Clipboard, Platform } from 'react-native'

interface ParsedLog {
    timestamp: Date
    level: string
    context?: string
    message: string
    raw: string
}

export const SendErrorReportScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()
    const { user } = useUser()
    const [description, setDescription] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [logContent, setLogContent] = useState<string>('')
    const [isCopyingLogs, setIsCopyingLogs] = useState<boolean>(false)

    // Функция для парсинга логов из текстового формата (взято из LogViewer)
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

    // Функция для загрузки логов
    const loadLogs = async () => {
        try {
            const content = await logger.getFileLogContent()
            setLogContent(content)
            return content
        } catch (error) {
            logger.error(error, 'SendErrorReportScreen', 'Failed to load logs')
            return ''
        }
    }

    // Функция для копирования логов в буфер обмена
    const copyLogsToClipboard = async () => {
        try {
            setIsCopyingLogs(true)
            // Загружаем логи, если они еще не загружены
            const content = logContent || await loadLogs()

            if (content) {
                Clipboard.setString(content)
                Alert.alert(
                    t('settings.sendErrorReport.copyLogs.success.title', 'Логи скопированы'),
                    t('settings.sendErrorReport.copyLogs.success.message', 'Логи успешно скопированы в буфер обмена')
                )
            } else {
                Alert.alert(
                    t('settings.sendErrorReport.copyLogs.error.title', 'Ошибка'),
                    t('settings.sendErrorReport.copyLogs.error.message', 'Не удалось загрузить логи')
                )
            }
        } catch (error) {
            logger.error(error, 'SendErrorReportScreen', 'Failed to copy logs')
            Alert.alert(
                t('settings.sendErrorReport.copyLogs.error.title', 'Ошибка'),
                t('settings.sendErrorReport.copyLogs.error.message', 'Не удалось скопировать логи')
            )
        } finally {
            setIsCopyingLogs(false)
        }
    }

    // Функция для отправки отчета об ошибке
    const sendErrorReport = async () => {
        try {
            setIsLoading(true)

            // Получаем логи из файла
            const logContent = await logger.getFileLogContent()
            setLogContent(logContent) // Сохраняем логи для возможного копирования
            const parsedLogs = parseLogContent(logContent)

            // Фильтруем логи только за сегодня
            const todayLogs = parsedLogs.filter(log => isToday(log.timestamp))

            // Подготавливаем данные для отправки
            const reportData = {
                user: {
                    id: user?.id,
                    email: user?.email,
                    username: user?.username,
                    firstName: user?.first_name,
                    lastName: user?.last_name
                },
                description,
                logs: todayLogs,
                deviceInfo: {
                    platform: Platform.OS,
                    version: Platform.Version,
                    model: Platform.OS === 'ios' ? '' : '',
                    timestamp: new Date().toISOString()
                }
            }

            // Отправляем на сервер
            await apiClient.post(API_ROUTES.ERROR_REPORT, reportData)

            // Информируем пользователя об успешной отправке
            Alert.alert(
                t('settings.sendErrorReport.success.title'),
                t('settings.sendErrorReport.success.message'),
                [{ text: t('common.ok'), onPress: onBack }]
            )

            logger.info('Error report sent successfully', 'SendErrorReportScreen')
        } catch (error) {
            logger.error(error, 'SendErrorReportScreen', 'Failed to send error report')
            Alert.alert(
                t('settings.sendErrorReport.error.title'),
                t('settings.sendErrorReport.error.message')
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View className="flex-1">
            <HeaderMenuItem onBack={onBack} title={t('settings.sendErrorReport.title')} />

            <View className="p-4 flex-1">
                <Text className="mb-4">{t('settings.sendErrorReport.description')}</Text>

                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('settings.sendErrorReport.descriptionPlaceholder')}
                    multiline
                    numberOfLines={5}
                    className="mb-6 p-4 bg-surface-paper rounded-md"
                />

                <Button
                    onPress={sendErrorReport}
                    disabled={!description.trim() || isLoading}
                    className="mb-4"
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        t('settings.sendErrorReport.sendButton')
                    )}
                </Button>

                <View className="bg-surface-paper p-4 rounded-md mb-4">
                    <Text className="text-sm text-secondary-light mb-2">
                        {t('settings.sendErrorReport.note')}
                    </Text>
                    <Text className="text-xs text-secondary-light">
                        • {t('settings.sendErrorReport.includedInfo.logs')}
                    </Text>
                    <Text className="text-xs text-secondary-light">
                        • {t('settings.sendErrorReport.includedInfo.userInfo')}
                    </Text>
                    <Text className="text-xs text-secondary-light">
                        • {t('settings.sendErrorReport.includedInfo.deviceInfo')}
                    </Text>
                </View>

                <Button
                    onPress={copyLogsToClipboard}
                    variant="outline"
                    disabled={isCopyingLogs}
                    className="mt-2"
                >
                    {isCopyingLogs ? (
                        <ActivityIndicator size="small" color="#6366f1" />
                    ) : (
                        t('settings.sendErrorReport.copyLogs.button')
                    )}
                </Button>
            </View>
        </View>
    )
}
