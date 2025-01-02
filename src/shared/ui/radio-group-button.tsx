// src/shared/ui/radio/RadioGroup.tsx
import { useTheme } from '@shared/context/theme-provider'
import { Text } from '@shared/ui/styled-text'
import { Check } from 'lucide-react-native'
import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'

interface RadioOption {
    label: string
    value: string
}

interface RadioGroupProps {
    options: RadioOption[]
    value: string
    onChange: (value: string) => void
    label?: string
    className?: string
    radioClassName?: string
    labelClassName?: string
    containerClassName?: string
}

interface RadioButtonProps {
    label: string
    isSelected: boolean
    onPress: () => void
    isFirst: boolean
    isLast: boolean
    showSeparator: boolean
    className?: string
}

const RadioButton = ({
    label,
    isSelected,
    onPress,
    isFirst,
    isLast,
    showSeparator,
    className = '',
}: RadioButtonProps) => {
    const { colors } = useTheme()

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1 : 0) }],
    }))

    return (
        <View>
            <Pressable
                onPress={onPress}
                className={`flex-row justify-between items-center py-4 px-4 bg-white dark:bg-black ${isFirst ? 'rounded-t-xl' : ''
                    } ${isLast ? 'rounded-b-xl' : ''} ${className}`}
            >
                <Text variant="default" size="base">
                    {label}
                </Text>
                <View className={`
          w-5 h-5 rounded-full border-2 
          items-center justify-center
          ${isSelected ? 'bg-background-dark dark:bg-surface-dark border-background-dark dark:border-surface-dark' : 'border-inactive'}
        `}>
                    {isSelected && (
                        <Animated.View style={animatedStyle}>
                            <Check
                                size={12}
                                color={colors.background}
                                strokeWidth={3}
                            />
                        </Animated.View>
                    )}
                </View>
            </Pressable>
            {showSeparator && !isLast && (
                <View className="h-[1px] bg-inactive/20 mx-4" />
            )}
        </View>
    )
}

export const RadioGroup = ({
    options,
    value,
    onChange,
    label,
    className = '',
    radioClassName = '',
    labelClassName = '',
    containerClassName = '',
}: RadioGroupProps) => {
    return (
        <View className={className}>
            {label && (
                <Text
                    variant="secondary"
                    size="sm"
                    className={`uppercase mb-4 ${labelClassName}`}
                >
                    {label}
                </Text>
            )}
            <View className={`overflow-hidden rounded-xl bg-surface dark:bg-surface-dark ${containerClassName}`}>
                {options.map((option, index) => (
                    <RadioButton
                        key={option.value}
                        label={option.label}
                        isSelected={value === option.value}
                        onPress={() => onChange(option.value)}
                        isFirst={index === 0}
                        isLast={index === options.length - 1}
                        showSeparator={true}
                        className={radioClassName}
                    />
                ))}
            </View>
        </View>
    )
}