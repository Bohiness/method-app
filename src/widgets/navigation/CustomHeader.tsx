// src/widgets/nav/CustomHeader.tsx
import { cn } from '@shared/lib/utils/cn'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Icon } from '@shared/ui/icon'
import { NotOnline } from '@shared/ui/system/NotOnline'
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
    showNetStatus?: boolean
}

export const CustomHeader = ({
    title,
    titleAlign = 'left',
    showBackButton = false,
    onBackPress,
    rightElement,
    leftElement,
    showNetStatus = true
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
            className="px-4"
            style={{ paddingTop: insets.top }}
        >
            <View className="flex-row items-center justify-between relative">
                {/* Левая часть */}
                <View className="flex-row items-center z-10">
                    {backButton}
                    {leftElement}
                </View>

                {/* Центральная часть */}
                {title && (
                    <View
                        className={cn(
                            "absolute left-0 right-0 items-center",
                            titleAlign !== 'center' && "items-start pl-10"
                        )}
                    >
                        <Title
                            align={titleAlign}
                            className="max-w-[70%]"
                        >
                            {t(title)}
                        </Title>
                        {showNetStatus && titleAlign === 'center' && <NotOnline />}
                    </View>
                )}

                {/* Правая часть */}
                <View className="z-10">
                    {rightElement}
                </View>
            </View>

            {/* NotOnline для варианта с выравниванием не по центру */}
            {showNetStatus && titleAlign !== 'center' && <NotOnline />}
        </View>
    )
}