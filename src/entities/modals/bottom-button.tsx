import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { Button } from '@shared/ui/button'
import { View } from '@shared/ui/view'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform } from 'react-native'
import Animated, { ComplexAnimationBuilder } from 'react-native-reanimated'

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
    isKeyboardVisible: propIsKeyboardVisible,
    enteringAnimation,
    canBack,
    canSkip,
    enabledBackButton,
    enabledNextButton,
    showButtonBlock = true
}) => {
    const { t } = useTranslation()
    const { isKeyboardVisible, keyboardHeight } = useKeyboard()

    // Используем значение из пропсов, если оно передано, иначе из хука
    const actualIsKeyboardVisible = propIsKeyboardVisible !== undefined ? propIsKeyboardVisible : isKeyboardVisible

    if (!showButtonBlock) {
        return null
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <View
                className={`pt-4 ${actualIsKeyboardVisible ? 'px-4' : 'px-6'}`}
                style={{
                    paddingBottom: 0,
                    position: actualIsKeyboardVisible ? 'absolute' : 'relative',
                    bottom: actualIsKeyboardVisible ? keyboardHeight : 0,
                    left: 0,
                    right: 0,
                    zIndex: 100
                }}
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
        </KeyboardAvoidingView>
    )
}
