import { Button } from '@shared/ui/button'
import { View } from '@shared/ui/view'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { ComplexAnimationBuilder } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface BottomButtonProps {
    onBack?: () => void
    onNext?: () => void
    nextCount?: number
    isKeyboardVisible?: boolean
    isFirstScreen?: boolean
    isLastScreen?: boolean
    enteringAnimation?: ComplexAnimationBuilder
    enabledBackButton?: boolean
    enabledNextButton?: boolean
    canBack?: boolean
    canSkip?: boolean
    showButtonBlock?: boolean
}

export const BottomButton: React.FC<BottomButtonProps> = ({
    onBack,
    onNext,
    nextCount,
    isFirstScreen,
    isLastScreen,
    isKeyboardVisible,
    enteringAnimation,
    canBack,
    canSkip,
    enabledBackButton,
    enabledNextButton,
    showButtonBlock = true
}) => {
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()

    if (!showButtonBlock) {
        return null
    }

    return (
        <View
            className={`pt-4 bg-background dark:bg-background-dark ${isKeyboardVisible ? 'px-0' : 'px-6'}`}
            style={{ paddingBottom: insets.bottom }}
        >
            <Animated.View entering={enteringAnimation} className="flex-row justify-between align-center">
                {!isFirstScreen && (
                    <Button onPress={onBack} variant="outline" leftIcon={"ChevronLeft"} disabled={enabledBackButton}>
                    </Button>
                )}
                <Button onPress={onNext} variant="outline" className="ml-auto" disabled={!enabledNextButton && !canSkip}>
                    {t('common.next')} {nextCount && `(${nextCount})`}
                </Button>
            </Animated.View>
        </View>
    )
}
