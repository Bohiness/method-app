import { useTheme } from '@shared/context/theme-provider'
import { Text } from '@shared/ui/text'
import React, { createContext, useContext } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'

interface SwitchGroupContextType {
    values: string[]
    onChange: (value: string) => void
}

const SwitchGroupContext = createContext<SwitchGroupContextType | null>(null)

interface SwitchProps {
    label?: string
    value: string
    checked?: boolean
    onChange?: (checked: boolean) => void
    className?: string
    labelClassName?: string
    disabled?: boolean
}

export const Switch = ({
    label,
    value,
    checked: controlledChecked,
    onChange,
    className = '',
    labelClassName = '',
    disabled = false,
}: SwitchProps) => {
    const { colors } = useTheme()
    const groupContext = useContext(SwitchGroupContext)

    const isInGroup = !!groupContext
    const checked = isInGroup
        ? groupContext.values.includes(value)
        : controlledChecked

    const handlePress = () => {
        if (disabled) return

        console.log('Switch handlePress вызван, isInGroup:', isInGroup, 'value:', value, 'checked:', checked)

        if (isInGroup) {
            groupContext.onChange(value)
        } else {
            onChange?.(!checked)
        }
    }

    const toggleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withSpring(checked ? 20 : 2) }],
    }))

    return (
        <Pressable
            onPress={handlePress}
            className={`flex-row justify-between items-center py-4 px-4 
            ${disabled ? 'opacity-50' : ''} ${className}`}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPressIn={() => console.log('Pressable onPressIn')}
        >
            <Text
                variant="default"
                size="base"
                className={labelClassName}
            >
                {label}
            </Text>

            <View className={`
                w-12 h-7 rounded-full
                ${checked
                    ? 'bg-surface-paper-dark dark:bg-surface-paper'
                    : 'bg-inactive/30 dark:bg-inactive/50'}
            `}>
                <Animated.View
                    style={[toggleAnimatedStyle]}
                    className={`
                        w-6 h-6 rounded-full my-0.5
                        bg-surface-paper dark:bg-surface-paper-dark
                        shadow-sm
                    `}
                />
            </View>
        </Pressable>
    )
}

interface SwitchGroupProps {
    values: string[]
    onChange: (values: string[]) => void
    children: React.ReactNode
    className?: string
    label?: string
    labelClassName?: string
}

export const SwitchGroup = ({
    values,
    onChange,
    children,
    className = '',
    label,
    labelClassName = '',
}: SwitchGroupProps) => {
    const handleChange = (value: string) => {
        console.log('SwitchGroup handleChange вызван, value:', value, 'текущие values:', values)
        const newValues = values.includes(value)
            ? values.filter(v => v !== value)
            : [...values, value]
        console.log('SwitchGroup новые values:', newValues)
        onChange(newValues)
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
            <SwitchGroupContext.Provider value={{ values, onChange: handleChange }}>
                <View className="rounded-xl overflow-hidden bg-surface-paper dark:bg-surface-paper-dark">
                    {React.Children.map(children, (child, index) => (
                        <>
                            {child}
                            {index < React.Children.count(children) - 1 && (
                                <View className="h-[1px] bg-inactive/20 mx-4" />
                            )}
                        </>
                    ))}
                </View>
            </SwitchGroupContext.Provider>
        </View>
    )
}