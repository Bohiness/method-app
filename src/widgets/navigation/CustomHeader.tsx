// src/widgets/nav/CustomHeader.tsx
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
    showBackButton?: boolean
    onBackPress?: () => void
    rightElement?: React.ReactNode
}

export const CustomHeader = ({
    title,
    showBackButton = true,
    onBackPress,
    rightElement
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

    return (
        <View className="flex-row items-center justify-between px-4 py-1" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center">
                {showBackButton && (
                    <HapticTab
                        onPress={handleBack}
                        className="mr-2"
                        hapticStyle="light"
                    >
                        <Icon
                            name="ChevronLeft"
                            size={24}
                        />
                    </HapticTab>
                )}
                {title && (
                    <Title>
                        {t(title)}
                    </Title>
                )}
            </View>

            {rightElement && (
                <View>
                    {rightElement}
                </View>
            )}
        </View>
    )
}