// src/shared/ui/menu-item/index.tsx
import { useTheme } from '@shared/context/theme-provider'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Text } from '@shared/ui/text'
import { ChevronRight } from 'lucide-react-native'
import React from 'react'
import { View } from 'react-native'
import { Icon, IconName } from '../icon'
import { Separator } from '../separator'

interface MenuItemProps {
    // Основные пропсы
    label: string
    onPress?: () => void

    // Настройка внешнего вида
    leftIcon?: IconName
    rightContent?: React.ReactNode
    showChevron?: boolean

    // Стилизация
    className?: string
    labelClassName?: string

    // Состояния
    disabled?: boolean
    isFirst?: boolean
    isLast?: boolean
    showSeparator?: boolean
}

export const MenuItem = ({
    label,
    onPress,
    leftIcon,
    rightContent,
    showChevron = true,
    className = '',
    labelClassName = '',
    disabled = false,
    isFirst = false,
    isLast = false,
    showSeparator = true,
}: MenuItemProps) => {
    const { colors, isDark } = useTheme()

    const handlePress = () => {
        if (disabled) return
        onPress?.()
    }

    return (
        <View>
            <HapticTab onPress={handlePress} >
                <View
                    className={`
                    flex-row items-center justify-between
                    py-6 px-6 
                    ${isDark ? 'bg-surface-paper-dark' : 'bg-surface-paper'}
                    ${isFirst ? 'rounded-t-xl' : ''}
                    ${isLast ? 'rounded-b-xl' : ''}
                    ${disabled ? 'opacity-50' : ''}
                    ${className}
                `}>
                    {/* Левая часть */}
                    <View className="flex-row items-center flex-1 gap-x-4">
                        {leftIcon && (
                            <Icon
                                name={leftIcon}
                                size={18}
                                color={colors.inactive}
                            />
                        )}

                        <Text
                            variant="default"
                            size="base"
                            className={labelClassName}
                        >
                            {label}
                        </Text>
                    </View>

                    {/* Правая часть */}
                    <View className="flex-row items-center gap-x-2">
                        <View>
                            {rightContent}
                        </View>
                        {showChevron && (
                            <ChevronRight
                                size={20}
                                color={colors.inactive}
                            />
                        )}
                    </View>
                </View>
            </HapticTab>

            {/* Разделитель */}
            {showSeparator && !isLast && (
                <Separator />
            )}
        </View>
    )
}

// Группа элементов меню
interface MenuGroupProps {
    children: React.ReactNode
    label?: string
    className?: string
    labelClassName?: string
}

export const MenuGroup = ({
    children,
    label,
    className = '',
    labelClassName = '',
}: MenuGroupProps) => {
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
            <View className="rounded-xl overflow-hidden bg-surface-paper dark:bg-surface-paper-dark">
                {React.Children.map(children, (child, index) => {
                    if (!React.isValidElement(child)) return child

                    return React.cloneElement(child, {
                        isFirst: index === 0,
                        isLast: index === React.Children.count(children) - 1,
                        showSeparator: true,
                        ...child.props,
                    })
                })}
            </View>
        </View>
    )
}