// src/shared/ui/input/input.tsx
import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Text } from '@shared/ui/text'
import { VoiceInputButton } from '@shared/ui/voice/VoiceInputButton'
import React, { forwardRef } from 'react'
import { TextInput, TextInputProps, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'

interface InputProps extends TextInputProps {
    label?: string
    error?: string
    helperText?: string
    className?: string
    labelClassName?: string
    inputClassName?: string
    showVoiceInput?: boolean
    value?: string
    onChangeText?: (text: string) => void
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

export const Input = forwardRef<TextInput, InputProps>(({
    label,
    error,
    helperText,
    className = '',
    labelClassName = '',
    inputClassName = '',
    onFocus,
    onBlur,
    showVoiceInput = false,
    value,
    onChangeText,
    ...props
}, ref) => {
    const { colors } = useTheme()
    const focused = useSharedValue(0)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{
            scale: withSpring(focused.value ? 1.02 : 1, {
                mass: 0.5,
                damping: 8,
                stiffness: 150,
            })
        }],
    }))

    const handleFocus = (e: any) => {
        focused.value = 1
        onFocus?.(e)
    }

    const handleBlur = (e: any) => {
        focused.value = 0
        onBlur?.(e)
    }

    return (
        <View className={cn("mb-4", className)}>
            {/* Label */}
            {label && (
                <Text
                    variant="default"
                    size="base"
                    weight="medium"
                    className={cn("mb-2", labelClassName)}
                >
                    {label}
                </Text>
            )}

            {/* Input */}
            <View className="relative">
                <AnimatedTextInput
                    ref={ref}
                    style={[animatedStyle]}
                    className={cn(`
                        py-4 px-4
                        rounded-xl
                        bg-surface-paper dark:bg-surface-paper-dark
                        border border-inactive/20
                        ${error ? 'border-error' : ''}
                        ${props.editable === false ? 'opacity-50' : ''}
                    `, inputClassName)}
                    placeholderTextColor={colors.inactive}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={value}
                    onChangeText={onChangeText}
                />

                {showVoiceInput && (
                    <View className="absolute right-2 top-1/2 -translate-y-1/2">
                        <VoiceInputButton
                            size="sm"
                            asButton
                            initialText={value}
                            onTranscribe={(text) => onChangeText?.(text)}
                        />
                    </View>
                )}
            </View>

            {/* Error message */}
            {error && (
                <Text
                    variant="error"
                    size="sm"
                    className="mt-1"
                >
                    {error}
                </Text>
            )}

            {/* Helper text */}
            {helperText && !error && (
                <Text
                    variant="secondary"
                    size="sm"
                    className="mt-1"
                >
                    {helperText}
                </Text>
            )}
        </View>
    )
})

// Добавляем displayName для лучшей отладки
Input.displayName = 'Input'