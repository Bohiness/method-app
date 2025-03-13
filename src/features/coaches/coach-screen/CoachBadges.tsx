import { cn } from '@shared/lib/utils/cn'
import { Badge } from '@shared/ui/badge'
import { Text } from '@shared/ui/text'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

interface CoachBadgesProps {
    title?: string
    items?: string[]
    translationPrefix?: string
    variant?: 'default' | 'outline' | 'secondary'
    className?: string
}

export const CoachBadges: React.FC<CoachBadgesProps> = ({
    title,
    items,
    translationPrefix,
    variant = 'outline',
    className
}) => {
    const { t } = useTranslation()

    if (!items?.length) return null

    return (
        <View className={cn("gap-y-4", className)}>
            <View className="gap-y-2">
                <Text
                    weight="semibold"
                >
                    {title}:
                </Text>

                <View className="flex-row flex-wrap gap-2">
                    {items.map((item, index) => (
                        <Badge
                            key={index}
                            variant={variant}
                        >
                            {t(`${translationPrefix}.${item}`)}
                        </Badge>
                    ))}
                </View>
            </View>
        </View>
    )
}
