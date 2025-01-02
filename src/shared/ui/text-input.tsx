// src/shared/ui/inputs/TextInput.tsx
import { Colors } from '@shared/constants/colors'
import { useColorScheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Text } from '@shared/ui/styled-text'
import { SearchIcon } from 'lucide-react-native'
import React, { forwardRef } from 'react'
import { Platform, TextInput as RNTextInput, TextInputProps, View } from 'react-native'

export interface StyledTextInputProps extends TextInputProps {
    /**
     * Лейбл над инпутом
     */
    label?: string
    /**
     * Текст ошибки
     */
    error?: string
    /**
     * Вспомогательный текст под инпутом
     */
    helperText?: string
    /**
     * Размер инпута
     */
    size?: 'sm' | 'md' | 'lg'
    /**
     * Вариант отображения
     */
    variant?: 'default' | 'filled' | 'outline'
    /**
     * Полная ширина
     */
    fullWidth?: boolean
    /**
     * Показывать счетчик символов
     */
    showCount?: boolean
    /**
     * Иконка слева
     */
    leftIcon?: React.ReactNode
    /**
     * Иконка справа
     */
    rightIcon?: React.ReactNode
    /**
     * Классы для контейнера
     */
    containerClassName?: string
    /**
     * Классы для инпута
     */
    inputClassName?: string
    /**
     * Заполнить всю доступную высоту
     */
    flex?: boolean
}

export const TextInput = forwardRef<RNTextInput, StyledTextInputProps>(
    (
        {
            label,
            error,
            helperText,
            size = 'md',
            variant = 'default',
            fullWidth = true,
            showCount = false,
            leftIcon,
            rightIcon,
            containerClassName,
            inputClassName,
            className,
            maxLength,
            value,
            placeholder,
            editable = true,
            flex = false,
            multiline = false,
            ...props
        },
        ref
    ) => {
        const colorScheme = useColorScheme()
        const colors = Colors[colorScheme]

        // Размеры для разных вариантов
        const sizeStyles = {
            sm: 'py-2 px-3 text-sm',
            md: 'py-3 px-4 text-lg',
            lg: 'py-4 px-5 text-lg'
        }

        // Стили для разных вариантов
        const variantStyles = {
            default: 'bg-background dark:bg-background-dark border border-border dark:border-border-dark text-text dark:text-text-dark',
            filled: 'bg-gray-100 dark:bg-gray-800 border-transparent',
            outline: 'bg-transparent border border-border dark:border-border-dark'
        }

        // Состояния
        const disabledStyles = !editable ? 'opacity-50' : ''
        const errorStyles = error ? 'border-error dark:border-error' : ''
        const activeStyles = ''

        // Стили для контейнера
        const containerStyles = cn(
            'flex',
            fullWidth ? 'w-full' : 'w-auto',
            flex ? 'flex-1' : '',
            containerClassName
        )

        // Базовые стили для инпута
        const baseInputStyles = cn(
            'rounded-xl w-full',
            sizeStyles[size],
            variantStyles[variant],
            disabledStyles,
            errorStyles,
            activeStyles,
            flex && 'h-full',
            inputClassName
        )

        return (
            <View className={containerStyles}>
                {/* Label */}
                {label && (
                    <Text
                        className="mb-1.5 text-sm font-medium text-text dark:text-text-dark"
                        variant="secondary"
                    >
                        {label}
                    </Text>
                )}

                {/* Input Container */}
                <View className={cn('relative', flex && 'flex-1')}>
                    {/* Left Icon */}
                    {leftIcon && (
                        <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                            {leftIcon}
                        </View>
                    )}

                    {/* Input */}
                    <RNTextInput
                        ref={ref}
                        {...props}
                        value={value}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        editable={editable}
                        multiline={multiline}
                        placeholderTextColor={colors.secondaryText}
                        className={cn(
                            baseInputStyles,
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        style={[
                            Platform.select({
                                ios: {
                                    paddingVertical: size === 'sm' ? 8 : size === 'md' ? 12 : 16
                                }
                            }),
                            flex && {
                                height: '100%',
                                textAlignVertical: multiline ? 'top' : 'center'
                            }
                        ]}
                    />

                    {/* Right Icon */}
                    {rightIcon && (
                        <View className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                            {rightIcon}
                        </View>
                    )}
                </View>

                {/* Bottom Row: Error, Helper Text, and Character Count */}
                <View className="flex-row justify-between mt-1">
                    <View className="flex-1">
                        {error ? (
                            <Text variant="error" size="sm">
                                {error}
                            </Text>
                        ) : helperText ? (
                            <Text variant="secondary" size="sm">
                                {helperText}
                            </Text>
                        ) : null}
                    </View>

                    {/* Character Counter */}
                    {showCount && maxLength && (
                        <Text
                            variant="secondary"
                            size="sm"
                            className={cn(
                                'text-right',
                                (value?.length || 0) >= maxLength && 'text-error'
                            )}
                        >
                            {value?.length || 0}/{maxLength}
                        </Text>
                    )}
                </View>
            </View>
        )
    }
)

TextInput.displayName = 'TextInput'

// Предустановленные варианты компонента
export const MultilineTextInput = forwardRef<RNTextInput, StyledTextInputProps>(
    (props, ref) => (
        <TextInput
            ref={ref}
            multiline
            textAlignVertical="top"
            {...props}
            style={{
                flex: props.flex ? 1 : undefined,
                height: props.flex ? '100%' : undefined,
                ...props.style
            }}
        />
    )
)

MultilineTextInput.displayName = 'MultilineTextInput'

export const SearchInput = forwardRef<RNTextInput, StyledTextInputProps>(
    (props, ref) => (
        <TextInput
            ref={ref}
            size="sm"
            variant="filled"
            placeholder={props.placeholder || 'Поиск...'}
            leftIcon={<SearchIcon size={20} />}
            {...props}
        />
    )
)

SearchInput.displayName = 'SearchInput'