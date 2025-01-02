import { useModal } from '@shared/context/modal-provider'
import { Icon, IconName } from '@shared/ui/icon'
import { Text } from '@shared/ui/styled-text'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View, ViewStyle } from 'react-native'



// Пример использования:
/*
import { Moon } from 'lucide-react-native'

// Базовое использование
<FeatureButton
    title="diary.mood.eveningReflection"
    description="diary.mood.sumUpYourDay"
    icon={Moon}
/>

// С модальным окном
<FeatureButton
    title="diary.mood.eveningReflection"
    description="diary.mood.sumUpYourDay"
    icon={Moon}
    modalContent={<MoodCheckin date={new Date()} />}
/>

// Кастомная стилизация
<FeatureButton
    title="custom.title"
    description="custom.description"
    icon={Sun}
    iconVariant="accent"
    titleVariant="tint"
    className="bg-primary"
    onPress={() => console.log('Custom action')}
/>
*/

interface FeatureButtonProps {
    // Основные пропсы
    title: string
    description?: string
    icon?: IconName
    iconSize?: number

    // Функциональные пропсы
    onPress?: () => void
    modalContent?: React.ReactNode

    // Стилизация
    className?: string
    iconVariant?: 'default' | 'secondary' | 'accent' | 'tint'
    titleVariant?: 'default' | 'secondary' | 'accent' | 'tint'
    descriptionVariant?: 'default' | 'secondary' | 'accent' | 'tint'
    titleSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
    descriptionSize?: 'xs' | 'sm' | 'base' | 'lg'
    style?: ViewStyle

    // Дополнительные пропсы
    disabled?: boolean
    testID?: string
}

export const FeatureButton: React.FC<FeatureButtonProps> = ({
    title,
    description,
    icon: IconComponent,
    iconSize = 48,
    onPress,
    modalContent,
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
    const { showBottomSheet } = useModal()

    const handlePress = useCallback(() => {
        try {
            if (modalContent) {
                showBottomSheet(
                    <View className="flex-1">
                        {modalContent}
                    </View>
                )
            }
            onPress?.()
        } catch (error) {
            console.error('Error handling button press:', error)
        }
    }, [modalContent, onPress, showBottomSheet])

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            testID={testID}
            className={`flex-1 w-max-full overflow-hidden rounded-3xl bg-surface dark:bg-surface-dark px-6 py-14 shadow-lg ${disabled ? 'opacity-50' : ''} ${className}`}
            style={style}
        >
            <View className="items-center space-y-4">
                {IconComponent && (
                    <Icon
                        name={IconComponent}
                        variant={iconVariant}
                        size={iconSize}
                    />
                )}
                <View className="space-y-1">
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
    )
}
