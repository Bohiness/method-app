import { cn } from '@shared/lib/utils/cn'
import { Badge } from '@shared/ui/badge'
import { Icon, IconName, IconVariant } from '@shared/ui/icon'
import { Separator } from '@shared/ui/separator'
import { Text } from '@shared/ui/text'
import { Tooltip } from '@shared/ui/tooltip'
import { View } from '@shared/ui/view'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

interface DiaryEntryStatsData {
    id: number
    user: number
    created_at: string
    content: string
    emotions: any[]
    emotions_data: any[]
    primary_emotion: string | null
    primary_emotion_data: any | null
    sentiment: number
    categories: any[]
    categories_data: any[]
    primary_category: string | null
    primary_category_data: any | null
    main_topic: string
    keywords: string[]
    question_count: number
    length: number
    insights: string[]
    triggers: string[]
    awareness_level: string
    self_confidence_score: number
    negative_thinking_tendency: number
}

const StatItem = ({ labelKey, value, icon, iconVariant, descriptionKey }: { labelKey: string; value: string | number; icon?: IconName; iconVariant?: IconVariant; descriptionKey?: string }) => {
    const { t } = useTranslation()

    const TriggerContent = (
        <View className="flex-row items-center flex-shrink gap-x-2">
            <Text weight="medium">{t(labelKey)}:</Text>
            {descriptionKey && <Icon name="Info" size={14} variant="secondary" />}
        </View>
    )

    return (
        <View className="flex-row items-start mb-3 gap-x-2">
            {icon && <Icon name={icon} size={18} variant={iconVariant || 'secondary'} className="mr-2.5 mt-0.5" />}
            {descriptionKey ? (
                <Tooltip textKey={descriptionKey} placement="top">
                    {TriggerContent}
                </Tooltip>
            ) : (
                TriggerContent
            )}
            <Text variant="secondary" className="flex-1 flex-wrap text-right">{value}</Text>
        </View>
    )
}

const ScoreBar = ({ labelKey, score, variant, descriptionKey }: { labelKey: string; score: number; variant: 'tint' | 'success' | 'warning'; descriptionKey?: string }) => {
    const { t } = useTranslation()
    const percentage = Math.round(score * 100)


    let Variant = {
        color: 'text-surface-stone dark:text-surface-stone-dark',
        backgroundColor: 'bg-surface-stone dark:bg-surface-stone-dark'
    }
    switch (variant) {
        case 'tint':
            Variant = {
                color: 'text-tint dark:text-tint-dark',
                backgroundColor: 'bg-tint dark:bg-tint-dark'
            }
        case 'success':
            Variant = {
                color: 'text-success dark:text-success-dark',
                backgroundColor: 'bg-success dark:bg-success-dark'
            }
        case 'warning':
            Variant = {
                color: 'text-warning dark:text-warning-dark',
                backgroundColor: 'bg-warning dark:bg-warning-dark'
            }
    }

    const TriggerContent = (
        <View className="flex-row items-center gap-x-2">
            <Text weight="medium" size="sm">{t(labelKey)}</Text>
            {descriptionKey && <Icon name="Info" size={14} variant="secondary" className="ml-1" />}
        </View>
    )

    return (
        <View className="mb-3.5">
            <View className="flex-row justify-between items-center mb-1.5">
                {descriptionKey ? (
                    <Tooltip textKey={descriptionKey} placement="top">
                        {TriggerContent}
                    </Tooltip>
                ) : (
                    TriggerContent
                )}
                <Text weight="semibold" size="sm" className={Variant.color}>{percentage}%</Text>
            </View>
            <View className={cn(`h-2 rounded-full overflow-hidden`)}>
                <View className={cn(`h-2`, Variant.backgroundColor)} style={{ width: `${percentage}%` }} />
            </View>
        </View>
    )
}

export const BeautifulEntryStats = ({ data }: { data: DiaryEntryStatsData }) => {
    const { t } = useTranslation()

    if (!data) return null

    const formattedDate = format(new Date(data.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })

    const SectionHeader = ({ titleKey, descriptionKey }: { titleKey: string; descriptionKey?: string }) => (
        <View className="flex-row items-center mb-2 gap-x-2 relative">
            <Text size="base" weight="semibold">{t(titleKey)}</Text>
            <View className="flex-row">
                {descriptionKey && (
                    <Tooltip textKey={descriptionKey} placement="right">
                        <Icon name="Info" size={16} variant="secondary" className="ml-2" />
                    </Tooltip>
                )}
            </View>
        </View>
    )

    return (
        <View variant="transparent">
            <Text size="xl" weight="bold" className="mb-5 text-center">{t('diary.stats.title')}</Text>

            <View className="gap-y-2">
                <StatItem labelKey="diary.stats.createdAt" value={formattedDate} />
                <StatItem labelKey="diary.stats.mainTopic" value={data.main_topic} descriptionKey="diary.stats.descriptions.mainTopic" />
                <StatItem labelKey="diary.stats.length" value={data.length} descriptionKey="diary.stats.descriptions.length" />
                <StatItem labelKey="diary.stats.questionCount" value={data.question_count} descriptionKey="diary.stats.descriptions.questionCount" />
            </View>

            <Separator className="my-6" />

            <View className="gap-y-2">
                <SectionHeader titleKey="diary.stats.indicators" />
                {data.sentiment && <ScoreBar labelKey="diary.stats.sentiment" score={data.sentiment} variant="tint" descriptionKey="diary.stats.descriptions.sentiment" />}
                {data.self_confidence_score && <ScoreBar labelKey="diary.stats.selfConfidence" score={data.self_confidence_score} variant="success" descriptionKey="diary.stats.descriptions.selfConfidence" />}
                {data.negative_thinking_tendency && <ScoreBar labelKey="diary.stats.negativeThinking" score={data.negative_thinking_tendency} variant="warning" descriptionKey="diary.stats.descriptions.negativeThinking" />}
                {data.awareness_level && <StatItem labelKey="diary.stats.awarenessLevel" value={t(data.awareness_level)} icon="BrainCircuit" />}
            </View>

            <Separator className="my-6" />

            {data.keywords && data.keywords.length > 0 && (
                <View>
                    <SectionHeader titleKey="diary.stats.keywords" descriptionKey="diary.stats.descriptions.keywords" />
                    <View className="flex-row flex-wrap gap-2">
                        {data.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                                {keyword}
                            </Badge>
                        ))}
                    </View>
                </View>
            )}

            <Separator className="my-6" />

            {data.insights && data.insights.length > 0 && (
                <View>
                    <SectionHeader titleKey="diary.stats.insights" descriptionKey="diary.stats.descriptions.insights" />
                    {data.insights.map((insight, index) => (
                        <View key={index} className="flex-row items-start mb-2">
                            <Text variant="secondary" className="flex-1">– {insight}</Text>
                        </View>
                    ))}
                </View>
            )}

            <Separator className="my-6" />

            {data.triggers && data.triggers.length > 0 && (
                <View>
                    <SectionHeader titleKey="diary.stats.triggers" descriptionKey="diary.stats.descriptions.triggers" />
                    {data.triggers.map((trigger, index) => (
                        <View key={index} className="flex-row items-start mb-2">
                            <Text variant="secondary" className="flex-1">– {trigger}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    )
}

