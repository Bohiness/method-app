import { useTranslation } from 'react-i18next'

import HTMLView from '@shared/lib/utils/parsers/HTMLView'
import { Journal, LocalJournal } from '@shared/types/diary/journal/JournalTypes'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { TouchableOpacity } from 'react-native'

// Компонент для отображения записи журнала
interface JournalCardProps {
    entry: Journal | LocalJournal
    onPress?: () => void
}

export const JournalCard: React.FC<JournalCardProps> = ({ entry, onPress }) => {
    const { t } = useTranslation()

    // Получаем иконку для основной эмоции или категории
    const getEmotionIcon = () => {
        if (entry.primary_emotion_data?.icon) {
            return entry.primary_emotion_data.icon
        }
        return '📝'
    }

    // Обрезка контента для предпросмотра
    const previewContent = entry.content.length > 120
        ? `${entry.content.substring(0, 120)}...`
        : entry.content

    return (
        <View
            variant='paper'
            className="mb-4 p-4 rounded-lg border-l-4 border-tint"
        >
            <TouchableOpacity onPress={onPress}>
                <View className="flex flex-row items-center justify-between mb-2">
                    <View className="flex flex-row items-center">
                        <Text className="text-2xl mr-2">{getEmotionIcon()}</Text>
                        <Text className="text-lg font-medium">
                            {entry.primary_emotion_data?.name || t('diary.beautifuldiary.journal.entry')}
                        </Text>
                    </View>
                </View>

                <HTMLView html={previewContent} />

                {entry.categories_data && entry.categories_data.length > 0 && (
                    <View className="flex flex-row flex-wrap">
                        {entry.categories_data.map((category, index) => (
                            <View
                                key={`category-${index}`}
                                className="mr-2 mb-1 px-2 py-1 bg-surface-stone rounded-md"
                            >
                                <Text variant='secondary' size='xs'>{category.name}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {entry.insights && entry.insights.length > 0 && (
                    <View className="mt-2">
                        <Text variant='secondary' size='xs' className="mb-1">{t('diary.beautifuldiary.journal.insights')}</Text>
                        <View className="flex flex-row flex-wrap">
                            {entry.insights.slice(0, 2).map((insight, index) => (
                                <View key={`insight-${index}`} className="flex flex-row items-center mr-3 mb-1">
                                    <Icon name="Lightbulb" size={12} className="mr-1" />
                                    <Text size='xs'>{insight}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {entry.primary_category_data && (
                    <View className="mt-2 flex flex-row items-center">
                        <Icon name="Tag" size={12} className="mr-1" />
                        <Text variant='secondary' size='xs'>
                            {t('diary.beautifuldiary.journal.mainCategory')}: {entry.primary_category_data.name}
                        </Text>
                    </View>
                )}

                {onPress && (
                    <View className="mt-3 items-end">
                        <Icon name="ChevronRight" variant="secondary" size={18} />
                    </View>
                )}
            </TouchableOpacity>
        </View>
    )
}
