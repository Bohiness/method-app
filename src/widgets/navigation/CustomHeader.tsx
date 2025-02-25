// src/widgets/nav/CustomHeader.tsx
import { cn } from '@shared/lib/utils/cn'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Icon } from '@shared/ui/icon'
import { Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface CustomHeaderProps {
    title?: string
    titleAlign?: 'left' | 'center' | 'right'
    showBackButton?: boolean
    onBackPress?: () => void
    rightElement?: React.ReactNode
    leftElement?: React.ReactNode
}

export const CustomHeader = ({
    title,
    titleAlign = 'left',
    showBackButton = false,
    onBackPress,
    rightElement,
    leftElement
}: CustomHeaderProps) => {
    const router = useRouter()
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()

    const handleBack = () => {
        if (onBackPress) {
            onBackPress()
        } else {
            router.back()
        }
    }

    const backButton = showBackButton && (
        <HapticTab
            onPress={handleBack}
            className="mr-2"
            hapticStyle="light"
        >
            <Icon name="ChevronLeft" size={24} />
        </HapticTab>
    )


    return (
        <View
            variant='default'
            className="px-4 py-1"
            style={{ paddingTop: insets.top }}
        >
            {titleAlign === 'center' ? (
                // Центрированный вариант
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center z-10">
                        {backButton}
                        {leftElement}
                    </View>

                    <View className="absolute inset-0 items-center justify-center">
                        {title && <Title>{t(title)}</Title>}
                    </View>

                    <View className="z-10">
                        {rightElement}
                    </View>
                </View>
            ) : (
                // Обычный вариант с выравниванием влево или вправо
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        {backButton}
                        {leftElement}
                        {title && (
                            <Title className={cn(
                                titleAlign === 'right' ? 'ml-auto' : ''
                            )}>
                                {t(title)}
                            </Title>
                        )}
                    </View>

                    {rightElement && (
                        <View className="z-10">
                            {rightElement}
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}