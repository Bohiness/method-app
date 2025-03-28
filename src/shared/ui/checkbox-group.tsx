import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Text } from '@shared/ui/text'
import { Check } from 'lucide-react-native'
import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'

interface CheckboxOption {
    label: string
    value: string
}

interface CheckboxItemProps {
    label: string
    isSelected: boolean
    onPress: () => void
    isFirst: boolean
    isLast: boolean
    showSeparator: boolean
    className?: string
    textSize?: 'sm' | 'base' | 'lg' | 'xl'
}

const CheckboxItem = ({
    label,
    isSelected,
    onPress,
    isFirst,
    isLast,
    showSeparator,
    className = '',
    textSize = 'base'
}: CheckboxItemProps) => {
    const { colors } = useTheme()

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1 : 0) }],
    }))

    return (
        <View>
            <Pressable
                onPress={onPress}
                className={`flex-row justify-between items-center py-4 px-4 bg-text-dark dark:bg-text
                    ${isFirst ? 'rounded-t-xl' : ''}
                    ${isLast ? 'rounded-b-xl' : ''}
                    ${className}`}
            >
                <Text variant="default" size={textSize}>
                    {label}
                </Text>
                <View className={`
                        w-5 h-5 rounded-md border-2 
                        items-center justify-center
                        ${isSelected ? 'bg-background-dark dark:bg-surface-paper border-background-dark dark:border-surface-paper' : 'border-inactive'}
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

interface CheckboxGroupProps {
    options: CheckboxOption[]
    values: string[]
    onChange: (values: string[]) => void
    label?: string
    className?: string
    checkboxClassName?: string
    labelClassName?: string
    containerClassName?: string
    textSize?: 'sm' | 'base' | 'lg' | 'xl'
    disabled?: boolean
}

export const CheckboxGroup = ({
    options,
    values,
    onChange,
    label,
    className = '',
    checkboxClassName = '',
    labelClassName = '',
    containerClassName = '',
    textSize = 'base',
    disabled = false
}: CheckboxGroupProps) => {
    const handleToggle = (value: string) => {
        if (values.includes(value)) {
            onChange(values.filter(v => v !== value))
        } else {
            onChange([...values, value])
        }
    }

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
            <View className={cn('overflow-hidden rounded-2xl bg-surface-paper dark:bg-surface-paper-dark', containerClassName)}>
                {options.map((option, index) => (
                    <CheckboxItem
                        key={option.value}
                        label={option.label}
                        isSelected={values.includes(option.value)}
                        onPress={() => {
                            if (!disabled) {
                                handleToggle(option.value)
                            }
                        }}
                        isFirst={index === 0}
                        isLast={index === options.length - 1}
                        showSeparator={true}
                        className={`${checkboxClassName} ${disabled ? 'opacity-50' : ''}`}
                        textSize={textSize}
                    />
                ))}
            </View>
        </View>
    )
} 