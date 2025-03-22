// src/shared/ui/inputs/TextInput.tsx
import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Caption, Text } from '@shared/ui/text'
import { SearchIcon, XIcon } from 'lucide-react-native'
import React, { forwardRef, memo, useCallback, useRef } from 'react'
import { GestureResponderEvent, Platform, Pressable, TextInput as RNTextInput, TextInputProps, View } from 'react-native'
import { VoiceInputButton } from './voice/VoiceInputButton'

export interface StyledTextInputProps extends TextInputProps {
    label?: string
    helperText?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'filled' | 'outline' | 'underline' | 'ghost'
    fullWidth?: boolean
    showCount?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    rightIconFunction?: () => void
    containerClassName?: string
    inputClassName?: string
    flex?: boolean
    voiceInput?: boolean
    voiceInputSize?: 'sm' | 'md' | 'lg'
    voiceInputVerticalAlign?: 'top' | 'bottom' | 'center'
    voiceInputOnActiveOnly?: boolean
    clearButton?: boolean
    error?: string
}

// Выносим основную функциональность в отдельный компонент
const TextInputComponent = forwardRef<RNTextInput, StyledTextInputProps>((
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
        voiceInput = false,
        voiceInputSize = 'md',
        voiceInputVerticalAlign = 'bottom',
        voiceInputOnActiveOnly = false,
        clearButton = false,
        onChangeText,
        ...props
    },
    ref
) => {
    const { colors } = useTheme()
    // Создаем внутренний ref для доступа к текстовому полю
    const inputRef = useRef<RNTextInput | null>(null)
    // Используем useRef для хранения последнего значения текста
    const lastValueRef = useRef(value)

    // Объединяем внешний ref и внутренний inputRef
    React.useImperativeHandle(ref, () => inputRef.current as RNTextInput)

    // Мемоизируем стили для разных размеров
    const getSizeStyles = useCallback(() => {
        const baseStyles = {
            sm: {
                paddingVertical: Platform.OS === 'android' ? 8 : 0,
                paddingHorizontal: 12,
                fontSize: 14,
                minHeight: Platform.select({ ios: 36, android: 34 })
            },
            md: {
                paddingVertical: Platform.OS === 'android' ? 10 : 0,
                paddingHorizontal: 16,
                fontSize: 16,
                minHeight: Platform.select({ ios: 44, android: 42 })
            },
            lg: {
                paddingVertical: Platform.OS === 'android' ? 12 : 0,
                paddingHorizontal: 20,
                fontSize: 18,
                minHeight: Platform.select({ ios: 52, android: 50 })
            }
        }
        return baseStyles[size]
    }, [size])

    const variantStyles = {
        default: 'bg-background dark:bg-background-dark border border-border dark:border-border-dark text-text dark:text-text-dark',
        filled: 'bg-surface-paper dark:bg-surface-paper-dark border-transparent',
        outline: 'bg-transparent border border-border dark:border-border-dark',
        underline: 'bg-transparent border-b border-border dark:border-border-dark text-text dark:text-text-dark rounded-none',
        ghost: 'bg-transparent border-none text-text dark:text-text-dark'
    }

    const disabledStyles = !editable ? 'opacity-50' : ''
    const errorStyles = error ? 'border-error dark:border-error' : ''

    const containerStyles = cn(
        'flex relative',
        fullWidth ? 'w-full' : 'w-auto',
        flex ? 'flex-1' : '',
        containerClassName
    )

    const baseInputStyles = cn(
        'rounded-xl w-full',
        variantStyles[variant],
        disabledStyles,
        errorStyles,
        flex && 'h-full',
        inputClassName
    )

    const sizeStyle = getSizeStyles()

    // Мемоизируем обработчик голосового ввода
    const handleVoiceTranscribe = useCallback((text: string) => {
        if (onChangeText) {
            // Используем функциональное обновление, чтобы гарантировать актуальное значение
            const currentValue = lastValueRef.current || ''
            const newText = currentValue ? `${currentValue} ${text}` : text
            lastValueRef.current = newText
            onChangeText(newText)
        }
    }, [onChangeText])

    // Обработчик изменения текста
    const handleChangeText = useCallback((text: string) => {
        if (onChangeText) {
            // Обновляем ref с последним значением
            lastValueRef.current = text
            onChangeText(text)
        }
    }, [onChangeText])

    // Обработчик очистки поля ввода
    const handleClear = useCallback((e: GestureResponderEvent) => {
        // Останавливаем стандартную обработку нажатия на кнопку
        e.preventDefault?.()
        e.stopPropagation?.()

        if (onChangeText) {
            lastValueRef.current = ''
            onChangeText('')

            // Принудительно устанавливаем фокус обратно
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }

        // Предотвращаем потерю фокуса
        return false
    }, [onChangeText])

    const voiceInputContainerStyles = cn(
        'absolute right-3 z-10',
        voiceInputOnActiveOnly && 'opacity-0 group-focus-within:opacity-100',
        voiceInputVerticalAlign === 'top' && 'top-3',
        voiceInputVerticalAlign === 'center' && 'top-1/2 -translate-y-1/2',
        voiceInputVerticalAlign === 'bottom' && 'bottom-3'
    )

    // Определим отступ справа для текстового поля в зависимости от наличия кнопок
    const rightPadding = () => {
        if (rightIcon) return 'pr-10'
        if (clearButton && value) return 'pr-10'
        return ''
    }

    return (
        <View className={containerStyles}>
            {label && (
                <Caption className='mb-2'>
                    {label}
                </Caption>
            )}

            <View className={cn('group relative', flex && 'flex-1')}>
                {leftIcon && (
                    <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                        {leftIcon}
                    </View>
                )}
                {voiceInput && (
                    <View className={voiceInputContainerStyles}>
                        <VoiceInputButton
                            size={voiceInputSize}
                            initialText={value}
                            onTranscribe={handleVoiceTranscribe}
                        />
                    </View>
                )}

                <RNTextInput
                    ref={inputRef}
                    {...props}
                    value={value}
                    onChangeText={handleChangeText}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    editable={editable}
                    multiline={multiline}
                    placeholderTextColor={colors.secondary.light}
                    className={cn(
                        baseInputStyles,
                        leftIcon && 'pl-10',
                        rightPadding(),
                        className
                    )}
                    style={[
                        sizeStyle,
                        {
                            textAlignVertical: multiline ? 'top' : 'center',
                            includeFontPadding: false,
                            paddingTop: Platform.OS === 'ios' ? 12 : undefined,
                            paddingBottom: Platform.OS === 'ios' ? 12 : undefined,
                        },
                        multiline && {
                            minHeight: sizeStyle.minHeight ? sizeStyle.minHeight * 3 : undefined
                        },
                        flex && {
                            flex: 1,
                            height: undefined
                        }
                    ]}
                />

                {clearButton && value && (
                    <Pressable
                        onPress={handleClear}
                        hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
                        className="absolute p-2 right-3 top-1/2 -translate-y-1/2 z-10"
                    >
                        <XIcon size={16} color={colors.secondary.light} />
                    </Pressable>
                )}

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

TextInputComponent.displayName = 'TextInput'

// Оборачиваем компонент в React.memo для предотвращения нежелательных рендеров
export const TextInput = memo(TextInputComponent)

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