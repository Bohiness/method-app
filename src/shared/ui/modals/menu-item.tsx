// src/shared/ui/menu-item/index.tsx
import { useTheme } from '@shared/context/theme-provider'
import { Text } from '@shared/ui/styled-text'
import { ChevronRight } from 'lucide-react-native'
import React from 'react'
import { Pressable, View } from 'react-native'
import { Icon, IconName } from '../icon'

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

    return (
        <View>
            <Pressable
                onPress={disabled ? undefined : onPress}
                className={`
                    flex-row items-center justify-between
                    py-4 px-4 
                    ${isDark ? 'bg-surface-dark' : 'bg-surface'}
                    ${isFirst ? 'rounded-t-xl' : ''}
                    ${isLast ? 'rounded-b-xl' : ''}
                    ${disabled ? 'opacity-50' : ''}
                    ${className}
                `}
            >
                {/* Левая часть */}
                <View className="flex-row items-center flex-1 gap-x-2">
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
                <View className="flex-row items-center">
                    {rightContent}
                    {showChevron && (
                        <ChevronRight
                            size={20}
                            color={colors.inactive}
                            className="m-2"
                        />
                    )}
                </View>
            </Pressable>

            {/* Разделитель */}
            {showSeparator && !isLast && (
                <View className="h-[1px] bg-inactive/20 mx-4" />
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
            <View className="rounded-xl overflow-hidden bg-surface dark:bg-surface-dark">
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