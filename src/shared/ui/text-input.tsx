// src/shared/ui/inputs/TextInput.tsx
import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Text } from '@shared/ui/text'
import { SearchIcon } from 'lucide-react-native'
import React, { forwardRef } from 'react'
import { Platform, Pressable, TextInput as RNTextInput, TextInputProps, View } from 'react-native'

export interface StyledTextInputProps extends TextInputProps {
    label?: string
    error?: string
    helperText?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'filled' | 'outline' | 'underline'
    fullWidth?: boolean
    showCount?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    rightIconFunction?: () => void
    containerClassName?: string
    inputClassName?: string
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
            rightIconFunction,
            ...props
        },
        ref
    ) => {
        const { colors } = useTheme()

        // Размеры для разных вариантов
        const getSizeStyles = () => {
            const baseStyles = {
                sm: {
                    paddingVertical: Platform.select({ ios: 10, android: 8 }),
                    paddingHorizontal: 12,
                    fontSize: 14,
                    lineHeight: 20,
                    minHeight: Platform.select({ ios: 36, android: 34 })
                },
                md: {
                    paddingVertical: Platform.select({ ios: 12, android: 10 }),
                    paddingHorizontal: 16,
                    fontSize: 16,
                    lineHeight: 24,
                    minHeight: Platform.select({ ios: 44, android: 42 })
                },
                lg: {
                    paddingVertical: Platform.select({ ios: 14, android: 12 }),
                    paddingHorizontal: 20,
                    fontSize: 18,
                    lineHeight: 28,
                    minHeight: Platform.select({ ios: 52, android: 50 })
                }
            }

            return baseStyles[size]
        }

        // Стили для разных вариантов
        const variantStyles = {
            default: 'bg-background dark:bg-background-dark border border-border dark:border-border-dark text-text dark:text-text-dark',
            filled: 'bg-surface-paper dark:bg-surface-paper-dark border-transparent',
            outline: 'bg-transparent border border-border dark:border-border-dark',
            underline: 'bg-transparent border-b border-border dark:border-border-dark text-text dark:text-text-dark rounded-none'
        }

        // Состояния
        const disabledStyles = !editable ? 'opacity-50' : ''
        const errorStyles = error ? 'border-error dark:border-error' : ''

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
            variantStyles[variant],
            disabledStyles,
            errorStyles,
            flex && 'h-full',
            inputClassName
        )

        const sizeStyle = getSizeStyles()

        return (
            <View className={containerStyles}>
                {label && (
                    <Text
                        className="mb-1.5 text-sm font-medium text-text dark:text-text-dark"
                        variant="secondary"
                    >
                        {label}
                    </Text>
                )}

                <View className={cn('relative', flex && 'flex-1')}>
                    {leftIcon && (
                        <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                            {leftIcon}
                        </View>
                    )}

                    <RNTextInput
                        ref={ref}
                        {...props}
                        value={value}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        editable={editable}
                        multiline={multiline}
                        placeholderTextColor={colors.secondary.light}
                        className={cn(
                            baseInputStyles,
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        style={[
                            sizeStyle,
                            multiline && {
                                textAlignVertical: 'top',
                                minHeight: sizeStyle.minHeight ? sizeStyle.minHeight * 3 : undefined
                            },
                            flex && {
                                flex: 1,
                                height: undefined
                            }
                        ]}
                    />

                    {rightIcon && (
                        <Pressable
                            onPress={rightIconFunction}
                            className="absolute p-2 right-3 top-1/2 -translate-y-1/2 z-10"
                        >
                            {rightIcon}
                        </Pressable>
                    )}
                </View>

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

export const MultilineTextInput = forwardRef<RNTextInput, StyledTextInputProps>(
    (props, ref) => (
        <TextInput
            ref={ref}
            multiline
            textAlignVertical="top"
            {...props}
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
            leftIcon={<SearchIcon size={20} color={props.editable !== false ? undefined : '#9CA3AF'} />}
            {...props}
        />
    )
)

SearchInput.displayName = 'SearchInput'