// src/shared/ui/radio/RadioGroup.tsx
import { useTheme } from '@shared/context/theme-provider'
import { Text } from '@shared/ui/text'
import { Check } from 'lucide-react-native'
import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'

interface CheckboxProps {
    checked: boolean
    onChange: (checked: boolean) => void
    className?: string
    isFirst?: boolean
    isLast?: boolean
    textSize?: 'sm' | 'base' | 'lg' | 'xl'
    label?: string
    disabled?: boolean
}

export const Checkbox = ({
    checked,
    onChange,
    className,
    isFirst,
    isLast,
    textSize = 'base',
    label,
    disabled = false,
}: CheckboxProps) => {
    const { colors } = useTheme()

    const handlePress = () => {
        if (!disabled) {
            onChange(!checked)
        }
    }

    const toggleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: withSpring(checked ? 1 : 0),
        transform: [{ scale: withSpring(checked ? 1 : 0.8) }],
    }))

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            accessibilityRole="checkbox"
            accessibilityState={{ checked, disabled }}
            accessibilityLabel={label}
            className={`
                flex-row justify-between items-center 
                ${isFirst ? 'rounded-t-xl' : ''}
                ${isLast ? 'rounded-b-xl' : ''}
                ${disabled ? 'opacity-50' : 'active:opacity-80'}
                ${className}
            `}
        >
            <Text
                variant="default"
                size={textSize}
                className={disabled ? 'opacity-50' : ''}
            >
                {label}
            </Text>
            <View className={`
                w-5 h-5 rounded-full border-2 
                items-center justify-center
                ${checked ? 'bg-background-dark dark:bg-surface-paper border-background-dark dark:border-surface-paper' : 'border-inactive'}
                ${disabled ? 'opacity-50' : ''}
            `}>
                <Animated.View style={toggleAnimatedStyle}>
                    <Check
                        size={12}
                        color={colors.background}
                        strokeWidth={3}
                    />
                </Animated.View>
            </View>
        </Pressable>
    )
}