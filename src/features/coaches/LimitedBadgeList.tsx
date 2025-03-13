// src/features/coaches/LimitedBadgeList.tsx
import { Badge } from '@shared/ui/badge'
import { Text } from '@shared/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

interface LimitedBadgeListProps {
    items: string[]
    limit?: number
    title: string
    translatePrefix?: string
    classContainer?: string
}

const LimitedBadgeList: React.FC<LimitedBadgeListProps> = ({
    items,
    limit = 2,
    title,
    translatePrefix,
    classContainer
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const { t } = useTranslation()

    const displayedItems = isExpanded ? items : items.slice(0, limit)
    const hiddenCount = items.length - limit

    return (
        <View className={classContainer}>
            <Text
                size="xs"
                className="mb-2"
            >
                {title}:
            </Text>

            <View className="flex-row flex-wrap gap-2">
                {displayedItems.map((item, index) => (
                    <Badge
                        key={index}
                        variant="outline"
                        size="sm"
                    >
                        {t(`${translatePrefix}.${item}`)}
                    </Badge>
                ))}

                {!isExpanded && hiddenCount > 0 && (

                    <Badge
                        size="sm"
                        variant="secondary"
                        onPress={() => setIsExpanded(true)}
                    >
                        {t('common.moreCount', { count: hiddenCount })}
                    </Badge>
                )}
            </View>
        </View>
    )
}

export default LimitedBadgeList