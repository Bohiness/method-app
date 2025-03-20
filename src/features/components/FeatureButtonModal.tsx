import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Icon, IconName, IconVariant } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { useTranslation } from 'react-i18next'
import { Pressable, View, ViewStyle } from 'react-native'

interface FeatureButtonProps {
    title: string
    description?: string
    icon?: IconName
    iconSize?: number
    onPress?: () => void
    modalContent?: React.ReactNode
    className?: string
    iconVariant?: 'default' | 'secondary' | 'accent' | 'tint'
    titleVariant?: 'default' | 'secondary' | 'accent' | 'tint'
    descriptionVariant?: 'default' | 'secondary' | 'accent' | 'tint'
    titleSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
    descriptionSize?: 'xs' | 'sm' | 'base' | 'lg'
    style?: ViewStyle
    disabled?: boolean | null
    testID?: string
}

export const FeatureButtonModal: React.FC<FeatureButtonProps> = ({
    title,
    description,
    icon: IconComponent,
    iconSize = 48,
    onPress,
    className = '',
    iconVariant = 'default',
    titleVariant = 'default',
    descriptionVariant = 'secondary',
    titleSize = 'lg',
    descriptionSize = 'sm',
    style,
    disabled = false,
    testID
}) => {
    const { t } = useTranslation()

    const handlePress = () => {
        if (!disabled && onPress) {
            onPress()
        }
    }

    return (
        <View
            className={`flex-1 w-max-full overflow-hidden rounded-3xl bg-surface-paper dark:bg-surface-paper-dark px-6 py-14 shadow-lg
                ${disabled ? 'opacity-50' : ''} ${className}`}
            style={style}
            testID={testID}
        >
            <HapticTab onPress={handlePress} disabled={disabled}>
                <Pressable onPress={handlePress} disabled={disabled}>
                    <View className="items-center gap-y-4">
                        {IconComponent && (
                            <Icon
                                name={IconComponent}
                                variant={iconVariant as IconVariant}
                                size={iconSize}
                            />
                        )}
                        <View className="gap-y-1">
                            <Text
                                size={titleSize}
                                weight="bold"
                                variant={titleVariant}
                                className="text-center mt-4 mb-2"
                            >
                                {t(title)}
                            </Text>
                            {description && (
                                <Text
                                    size={descriptionSize}
                                    variant={descriptionVariant}
                                    className="text-center"
                                >
                                    {t(description)}
                                </Text>
                            )}
                        </View>
                    </View>
                </Pressable>
            </HapticTab>
        </View>
    )
}