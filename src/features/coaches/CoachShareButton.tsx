// src/features/coach/share/ui/CoachShareButton.tsx
import { useTheme } from '@shared/context/theme-provider'
import { useCoachShare } from '@shared/hooks/coaches/useCoachShare'
import { cn } from '@shared/lib/utils/cn'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Icon } from '@shared/ui/icon'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'

interface CoachShareButtonProps {
    coachId: number
    className?: string
    size?: number
}

export const CoachShareButton: React.FC<CoachShareButtonProps> = ({
    coachId,
    className,
    size = 20
}) => {
    const { shareCoach, isPending } = useCoachShare(coachId)
    const { colors } = useTheme()

    if (isPending) {
        return (
            <View className={cn("items-center justify-center", className)}>
                <ActivityIndicator size={size} color={colors.text} />
            </View>
        )
    }

    return (
        <HapticTab
            onPress={shareCoach}
            className={cn("items-center justify-center", className)}
            hapticStyle="light"
        >
            <Icon
                name="Share"
                size={size}
                color={colors.text}
                className="select-none"
            />
        </HapticTab>
    )
}

// Предустановленные размеры
export const SmallCoachShareButton: React.FC<Omit<CoachShareButtonProps, 'size'>> = (props) => (
    <CoachShareButton {...props} size={16} className="w-8 h-8" />
)

export const LargeCoachShareButton: React.FC<Omit<CoachShareButtonProps, 'size'>> = (props) => (
    <CoachShareButton {...props} size={24} className="w-12 h-12" />
)
