import {
    useJournal,
    useJournalHistory,
    useJournalProfile,
    useJournalStatistics,
    useJournalTemplates
} from '@shared/hooks/diary/journal/useJournal'
import { LocalJournal } from '@shared/types/diary/journal/JournalTypes'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native'

enum Tab {
    JOURNALS = 'journals',
    TEMPLATES = 'templates',
    STATISTICS = 'statistics',
    PROFILE = 'profile',
    SYNC_DEBUG = 'sync_debug'
}

export const JournalScreen = () => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<Tab>(Tab.JOURNALS)
    const [selectedJournalId, setSelectedJournalId] = useState<number | undefined>()
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [debugContent, setDebugContent] = useState<string>('')

    // Используем хуки для работы с журналом
    const {
        create,
        update,
        delete: deleteJournal,
        analyze,
        getDetails,
        openJournalModal,
        deleteTemplate,
        convertTemplateToJournal
    } = useJournal()

    // Получаем данные
    const { data: journals, isLoading: isLoadingJournals, refetch: refetchJournals } = useJournalHistory()
    const { data: templates, isLoading: isLoadingTemplates, refetch: refetchTemplates } = useJournalTemplates()
    const { data: statistics, isLoading: isLoadingStatistics, refetch: refetchStatistics } = useJournalStatistics()
    const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useJournalProfile()
    const { data: selectedJournal, isLoading: isLoadingJournalDetails } = getDetails(selectedJournalId)
    const { data: selectedTemplate, isLoading: isLoadingTemplateDetails } = getDetails(selectedTemplateId)

    // Обработчики действий
    const handleCreateJournal = async () => {
        try {
            setDebugContent('Создание новой записи...')
            const newJournal = await create.mutateAsync({
                content: 'Новая запись журнала для тестирования',
            })
            setDebugContent(`Запись создана с ID: ${newJournal.local_id}`)
            refetchJournals()
        } catch (error) {
            setDebugContent(`Ошибка при создании: ${error}`)
        }
    }

    const handleCreateTemplate = async () => {
        try {
            setDebugContent('Создание нового шаблона...')
            const newTemplate = await create.mutateAsync({
                content: 'Новый шаблон для тестирования',
                isTemplate: true
            })
            setDebugContent(`Шаблон создан с ID: ${newTemplate.local_id}`)
            refetchTemplates()
        } catch (error) {
            setDebugContent(`Ошибка при создании шаблона: ${error}`)
        }
    }

    const handleUpdateJournal = async (id: number) => {
        try {
            setDebugContent(`Обновление записи ${id}...`)
            await update.mutateAsync({
                id,
                data: {
                    content: `Обновленное содержание (${new Date().toISOString()})`
                }
            })
            setDebugContent(`Запись ${id} обновлена`)
            refetchJournals()
        } catch (error) {
            setDebugContent(`Ошибка при обновлении: ${error}`)
        }
    }

    const handleDeleteJournal = async (id: number) => {
        try {
            setDebugContent(`Удаление записи ${id}...`)
            await deleteJournal.mutateAsync(id)
            setDebugContent(`Запись ${id} удалена`)
            setSelectedJournalId(undefined)
            refetchJournals()
        } catch (error) {
            setDebugContent(`Ошибка при удалении: ${error}`)
        }
    }

    const handleDeleteTemplate = async (id: number) => {
        try {
            setDebugContent(`Удаление шаблона ${id}...`)
            await deleteTemplate.mutateAsync(id)
            setDebugContent(`Шаблон ${id} удален`)
            setSelectedTemplateId(undefined)
            refetchTemplates()
        } catch (error) {
            setDebugContent(`Ошибка при удалении шаблона: ${error}`)
        }
    }

    const handleAnalyzeJournal = async (id: number) => {
        try {
            setDebugContent(`Анализ записи ${id}...`)
            await analyze.mutateAsync(id)
            setDebugContent(`Запись ${id} проанализирована`)
            refetchJournals()
        } catch (error) {
            setDebugContent(`Ошибка при анализе: ${error}`)
        }
    }

    const handleConvertTemplateToJournal = async (id: number) => {
        try {
            setDebugContent(`Конвертация шаблона ${id} в запись...`)
            const journal = await convertTemplateToJournal.mutateAsync(id)
            setDebugContent(`Шаблон ${id} конвертирован в запись ${journal.local_id}`)
            refetchTemplates()
            refetchJournals()
        } catch (error) {
            setDebugContent(`Ошибка при конвертации: ${error}`)
        }
    }

    const onRefresh = async () => {
        setIsRefreshing(true)
        try {
            if (activeTab === Tab.JOURNALS) {
                await refetchJournals()
            } else if (activeTab === Tab.TEMPLATES) {
                await refetchTemplates()
            } else if (activeTab === Tab.STATISTICS) {
                await refetchStatistics()
            } else if (activeTab === Tab.PROFILE) {
                await refetchProfile()
            }
            setDebugContent('Данные обновлены')
        } catch (error) {
            setDebugContent(`Ошибка при обновлении: ${error}`)
        } finally {
            setIsRefreshing(false)
        }
    }

    // Рендер журналов
    const renderJournals = () => {
        if (isLoadingJournals) {
            return <ActivityIndicator size="large" className="my-4" />
        }

        if (!journals || journals.length === 0) {
            return (
                <View className="p-4">
                    <Text>{t('Записей не найдено')}</Text>
                </View>
            )
        }

        return (
            <View>
                <View className="flex-row justify-between items-center p-4">
                    <Text size="xl" weight="bold">{t('Список записей')} ({journals.length})</Text>
                    <Button
                        variant="default"
                        leftIcon="Plus"
                        onPress={handleCreateJournal}
                        disabled={create.isPending}
                    >
                        {t('Создать')}
                    </Button>
                </View>

                <ScrollView className="max-h-48">
                    {journals.map((journal) => {
                        // Приводим Journal к LocalJournal
                        const localJournal = journal as LocalJournal
                        return (
                            <View
                                key={localJournal.local_id}
                                className={`p-3 border-b border-border ${selectedJournalId === localJournal.local_id ? 'bg-surface-stone' : ''}`}
                            >
                                <View className="flex-row justify-between">
                                    <View className="flex-1">
                                        <Text weight="semibold">ID: {localJournal.local_id} {localJournal.id ? `(Server: ${localJournal.id})` : '(Local)'}</Text>
                                        <Text variant="secondary" size="sm" numberOfLines={1}>
                                            {localJournal.content.substring(0, 50)}{localJournal.content.length > 50 ? '...' : ''}
                                        </Text>
                                        <Text variant="secondary" size="xs">
                                            {localJournal.created_at ? format(new Date(localJournal.created_at), 'dd MMMM yyyy HH:mm', { locale: ru }) : 'Нет даты'}
                                        </Text>
                                    </View>
                                    <View className="flex-row">
                                        <Button
                                            variant="ghost"
                                            leftIcon="Eye"
                                            size="sm"
                                            onPress={() => setSelectedJournalId(localJournal.local_id)}
                                        />
                                        <Button
                                            variant="ghost"
                                            leftIcon="Pencil"
                                            size="sm"
                                            onPress={() => handleUpdateJournal(localJournal.local_id)}
                                            disabled={update.isPending}
                                        />
                                        <Button
                                            variant="ghost"
                                            leftIcon="Trash"
                                            size="sm"
                                            onPress={() => handleDeleteJournal(localJournal.local_id)}
                                            disabled={deleteJournal.isPending}
                                        />
                                        <Button
                                            variant="ghost"
                                            leftIcon="Brain"
                                            size="sm"
                                            onPress={() => handleAnalyzeJournal(localJournal.local_id)}
                                            disabled={analyze.isPending}
                                        />
                                    </View>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>

                {selectedJournalId && (
                    <View variant='paper' className="mt-4 p-4 rounded-lg">
                        <Text size="lg" weight="bold">{t('Детали записи')}</Text>
                        {isLoadingJournalDetails ? (
                            <ActivityIndicator size="small" className="my-2" />
                        ) : selectedJournal ? (
                            <View className="mt-2">
                                {/* Приводим Journal к LocalJournal */}
                                <Text weight="medium">{t('ID')}: {(selectedJournal as LocalJournal).local_id}</Text>
                                <Text weight="medium">{t('Серверный ID')}: {selectedJournal.id || 'Нет'}</Text>
                                <Text weight="medium">{t('Статус')}: {(selectedJournal as any).sync_status || 'Нет'}</Text>
                                <Text weight="medium">{t('Дата создания')}: {selectedJournal.created_at ?
                                    format(new Date(selectedJournal.created_at), 'dd MMMM yyyy HH:mm', { locale: ru }) : 'Нет даты'}</Text>
                                <Text weight="medium">{t('Дата обновления')}: {(selectedJournal as any).updated_at ?
                                    format(new Date((selectedJournal as any).updated_at), 'dd MMMM yyyy HH:mm', { locale: ru }) : 'Нет даты'}</Text>
                                <Text weight="medium" className="mt-1">{t('Содержание')}:</Text>
                                <View variant='paper' className="p-2 my-1 rounded">
                                    <Text>{selectedJournal.content}</Text>
                                </View>
                                {(selectedJournal as any).analysis && (
                                    <View>
                                        <Text weight="medium" className="mt-1">{t('Анализ')}:</Text>
                                        <View variant='paper' className="p-2 my-1 rounded">
                                            <Text weight="medium">{t('Категория')}: {(selectedJournal as any).analysis.category || selectedJournal.category || 'Нет'}</Text>
                                            <Text weight="medium">{t('Эмоция')}: {(selectedJournal as any).analysis.emotion || selectedJournal.emotion || 'Нет'}</Text>
                                            <Text weight="medium">{t('Уровень осознанности')}: {(selectedJournal as any).analysis.awareness_level || selectedJournal.awareness_level || 'Нет'}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <Text>{t('Запись не найдена')}</Text>
                        )}
                    </View>
                )}
            </View>
        )
    }

    // Рендер шаблонов
    const renderTemplates = () => {
        if (isLoadingTemplates) {
            return <ActivityIndicator size="large" className="my-4" />
        }

        if (!templates || templates.length === 0) {
            return (
                <View className="p-4">
                    <Text>{t('Шаблонов не найдено')}</Text>
                </View>
            )
        }

        return (
            <View>
                <View className="flex-row justify-between items-center p-4">
                    <Text size="xl" weight="bold">{t('Шаблоны')} ({templates.length})</Text>
                    <Button
                        variant="default"
                        leftIcon="Plus"
                        onPress={handleCreateTemplate}
                        disabled={create.isPending}
                    >
                        {t('Создать шаблон')}
                    </Button>
                </View>

                <ScrollView className="max-h-48">
                    {templates.map((template) => {
                        // Приводим Journal к LocalJournal
                        const localTemplate = template as LocalJournal
                        return (
                            <View
                                key={localTemplate.local_id}
                                className={`p-3 border-b border-border ${selectedTemplateId === localTemplate.local_id ? 'bg-surface-stone' : ''}`}
                            >
                                <View className="flex-row justify-between">
                                    <View className="flex-1">
                                        <Text weight="semibold">ID: {localTemplate.local_id}</Text>
                                        <Text variant="secondary" size="sm" numberOfLines={1}>
                                            {localTemplate.content.substring(0, 50)}{localTemplate.content.length > 50 ? '...' : ''}
                                        </Text>
                                    </View>
                                    <View className="flex-row">
                                        <Button
                                            variant="ghost"
                                            leftIcon="Eye"
                                            size="sm"
                                            onPress={() => setSelectedTemplateId(localTemplate.local_id)}
                                        />
                                        <Button
                                            variant="ghost"
                                            leftIcon="Copy"
                                            size="sm"
                                            onPress={() => handleConvertTemplateToJournal(localTemplate.local_id)}
                                            disabled={convertTemplateToJournal.isPending}
                                        />
                                        <Button
                                            variant="ghost"
                                            leftIcon="Trash"
                                            size="sm"
                                            onPress={() => handleDeleteTemplate(localTemplate.local_id)}
                                            disabled={deleteTemplate.isPending}
                                        />
                                    </View>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>

                {selectedTemplateId && (
                    <View variant='paper' className="mt-4 p-4 rounded-lg">
                        <Text size="lg" weight="bold">{t('Детали шаблона')}</Text>
                        {isLoadingTemplateDetails ? (
                            <ActivityIndicator size="small" className="my-2" />
                        ) : selectedTemplate ? (
                            <View className="mt-2">
                                <Text weight="medium">{t('ID')}: {(selectedTemplate as LocalJournal).local_id}</Text>
                                <Text weight="medium" className="mt-1">{t('Содержание')}:</Text>
                                <View variant='paper' className="p-2 my-1 rounded">
                                    <Text>{selectedTemplate.content}</Text>
                                </View>
                            </View>
                        ) : (
                            <Text>{t('Шаблон не найден')}</Text>
                        )}
                    </View>
                )}
            </View>
        )
    }

    // Рендер статистики
    const renderStatistics = () => {
        if (isLoadingStatistics) {
            return <ActivityIndicator size="large" className="my-4" />
        }

        if (!statistics) {
            return (
                <View className="p-4">
                    <Text>{t('Статистика недоступна')}</Text>
                </View>
            )
        }

        return (
            <View className="p-4">
                <Text size="xl" weight="bold">{t('Статистика')}</Text>
                <View variant='paper' className="mt-4 p-4 rounded-lg">
                    <Text weight="medium">{t('Всего записей')}: {statistics.total_entries}</Text>
                    <Text weight="medium">{t('Проанализировано')}: {Math.floor(statistics.total_entries * 0.8)} {/* Примерное значение */}</Text>
                    <Text weight="medium">{t('Количество дней')}: {statistics.journal_days}</Text>

                    <Text size="lg" weight="bold" className="mt-4">{t('Категории')}</Text>
                    {Object.entries(statistics.categories).map(([name, count], index) => (
                        <View key={index} className="flex-row justify-between my-1">
                            <Text>{name}</Text>
                            <Text>{count}</Text>
                        </View>
                    ))}

                    <Text size="lg" weight="bold" className="mt-4">{t('Эмоции')}</Text>
                    {Object.entries(statistics.emotions).map(([name, count], index) => (
                        <View key={index} className="flex-row justify-between my-1">
                            <Text>{name}</Text>
                            <Text>{count}</Text>
                        </View>
                    ))}
                </View>
            </View>
        )
    }

    // Рендер профиля
    const renderProfile = () => {
        if (isLoadingProfile) {
            return <ActivityIndicator size="large" className="my-4" />
        }

        if (!profile) {
            return (
                <View className="p-4">
                    <Text>{t('Профиль недоступен')}</Text>
                </View>
            )
        }

        return (
            <View className="p-4">
                <Text size="xl" weight="bold">{t('Психологический профиль')}</Text>
                <View variant='paper' className="mt-4 p-4 rounded-lg">
                    <Text weight="medium">{t('Дата обновления')}: {profile.last_updated ?
                        format(new Date(profile.last_updated), 'dd MMMM yyyy', { locale: ru }) : 'Нет'}</Text>

                    <Text size="lg" weight="bold" className="mt-4">{t('Характеристики')}</Text>
                    <Text weight="medium">{t('Основная категория')}: {profile.top_category || 'Не определена'}</Text>
                    <Text weight="medium">{t('Уровень осознанности')}: {profile.awareness_level || 'Не определен'}</Text>
                    <Text weight="medium">{t('Средняя эмоция')}: {profile.avg_emotion || 'Не определена'}</Text>
                    <Text weight="medium">{t('Стиль мышления')}: {profile.thinking_style || 'Не определен'}</Text>

                    {profile.common_triggers && profile.common_triggers.length > 0 && (
                        <View className="mt-4">
                            <Text size="lg" weight="bold">{t('Триггеры')}</Text>
                            {profile.common_triggers.map((trigger, index) => (
                                <Text key={index} weight="medium">• {trigger}</Text>
                            ))}
                        </View>
                    )}

                    {profile.cognitive_distortions && Object.keys(profile.cognitive_distortions).length > 0 && (
                        <View className="mt-4">
                            <Text size="lg" weight="bold">{t('Когнитивные искажения')}</Text>
                            {Object.entries(profile.cognitive_distortions).map(([name, count], index) => (
                                <View key={index} className="flex-row justify-between my-1">
                                    <Text>{name}</Text>
                                    <Text>{count}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        )
    }

    // Рендер отладки синхронизации
    const renderSyncDebug = () => {
        return (
            <View className="p-4">
                <Text size="xl" weight="bold">{t('Отладка синхронизации')}</Text>
                <View className="mt-4">
                    <Text weight="medium" className="mb-2">{t('Последние действия')}:</Text>
                    <View variant='paper' className="p-3 rounded-lg">
                        <Text>{debugContent || t('Нет данных')}</Text>
                    </View>
                </View>
                <View className="mt-4 flex-row">
                    <Button
                        leftIcon="RotateCw"
                        onPress={onRefresh}
                        disabled={isRefreshing}
                        className="mr-2"
                    >
                        {t('Обновить данные')}
                    </Button>
                    <Button
                        leftIcon="Plus"
                        onPress={openJournalModal}
                    >
                        {t('Открыть модалку')}
                    </Button>
                </View>
            </View>
        )
    }

    return (
        <View variant="paper" className="flex-1">
            <View className="flex-row bg-surface-stone p-2">
                {Object.values(Tab).map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? 'default' : 'ghost'}
                        size="sm"
                        onPress={() => setActiveTab(tab)}
                        className="mr-1"
                    >
                        {t(tab)}
                    </Button>
                ))}
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {activeTab === Tab.JOURNALS && renderJournals()}
                {activeTab === Tab.TEMPLATES && renderTemplates()}
                {activeTab === Tab.STATISTICS && renderStatistics()}
                {activeTab === Tab.PROFILE && renderProfile()}
                {activeTab === Tab.SYNC_DEBUG && renderSyncDebug()}
            </ScrollView>
        </View>
    )
}
