import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Icon, IconName } from '@shared/ui/icon'
import { FullScreenModal } from '@shared/ui/modals/fullscreen-modal'
import { Text } from '@shared/ui/styled-text'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, ViewStyle } from 'react-native'

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
    disabled?: boolean
    testID?: string
}

export const FeatureButtonModal: React.FC<FeatureButtonProps> = ({
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
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handlePress = useCallback(() => {
        try {
            if (modalContent) {
                setIsModalVisible(true)
            }
            onPress?.()
        } catch (error) {
            console.error('Error handling button press:', error)
        }
    }, [modalContent, onPress])

    return (
        <>
            <HapticTab
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
            </HapticTab>

            {modalContent && (
                <FullScreenModal
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    showCloseButton={true}
                >
                    {React.cloneElement(modalContent as React.ReactElement, {
                        onClose: () => setIsModalVisible(false)
                    })}
                </FullScreenModal>
            )}
        </>
    )
}