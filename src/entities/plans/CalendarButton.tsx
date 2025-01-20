import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'

export const CalendarButton = ({ date, isActive, onPress }: {
    date?: Date,
    isActive?: boolean,
    onPress: () => void
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    // День месяца для отображения в иконке
    const dayNumber = date ? date.getDate() : undefined

    return (
        <Button
            onPress={onPress}
            size='sm'
            variant={isActive ? 'ghost' : 'ghost'}
            className="relative"
        >
            <View className="relative">
                <Icon name="Calendar" size={26} />
                {dayNumber && (
                    <Text
                        className={cn(
                            "absolute left-0 right-0 text-center top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px]",
                            isActive ? "text-text dark:text-text-dark" : "text-text-dark dark:text-text"
                        )}
                        style={{
                            transform: [{ translateY: Platform.OS === 'ios' ? -1 : 0 }]
                        }}
                    >
                        {dayNumber}
                    </Text>
                )}
            </View>
        </Button>
    )
}