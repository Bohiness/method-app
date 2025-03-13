import { useColors } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { ChevronDown } from 'lucide-react-native'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Modal,
    Pressable,
    ScrollView,
    StyleProp,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native'
import Animated, {
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated'
import { Text } from './text'

export interface SelectOption {
    label: string
    value: string | number
    disabled?: boolean
}

interface SelectProps {
    /**
     * Опции для выбора
     */
    options: SelectOption[]
    /**
     * Значение по умолчанию
     */
    value?: string | number
    /**
     * Callback при изменении значения
     */
    onValueChange?: (value: string | number) => void
    /**
     * Placeholder для select
     */
    placeholder?: string
    /**
     * Заголовок для select
     */
    label?: string
    /**
     * Текст ошибки
     */
    error?: string
    /**
     * Вспомогательный текст
     */
    helperText?: string
    /**
     * Отключить select
     */
    disabled?: boolean
    /**
     * Дополнительные стили для контейнера
     */
    style?: StyleProp<ViewStyle>
    /**
     * Дополнительные стили для текста
     */
    textStyle?: StyleProp<TextStyle>
    /**
     * Дополнительные классы
     */
    className?: string
}

export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onValueChange,
    placeholder,
    label,
    error,
    helperText,
    disabled = false,
    style,
    textStyle,
    className,
}) => {
    const { t } = useTranslation()
    const colors = useColors()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState<string | number | undefined>(value)
    const buttonRef = useRef<View>(null)
    const [buttonLayout, setButtonLayout] = useState({ pageX: 0, pageY: 0, width: 0 })

    // Анимация стрелки
    const arrowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: withSpring(isOpen ? '180deg' : '0deg') }],
    }))

    // Получаем текст выбранного значения
    const selectedOption = options.find((option) => option.value === selectedValue)

    // Обработчик выбора значения
    const handleSelect = useCallback((option: SelectOption) => {
        if (option.disabled) return
        setSelectedValue(option.value)
        onValueChange?.(option.value)
        setIsOpen(false)
    }, [onValueChange])

    // Измеряем позицию кнопки для модального окна
    const measureButton = () => {
        buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setButtonLayout({ pageX, pageY: pageY + height, width })
        })
    }

    return (
        <View style={style} className={className}>
            {/* Label */}
            {label && (
                <Text
                    variant="secondary"
                    size="sm"
                    className="mb-1"
                >
                    {label}
                </Text>
            )}

            {/* Select Button */}
            <Pressable
                ref={buttonRef}
                onPress={() => {
                    if (!disabled) {
                        measureButton()
                        setIsOpen(true)
                    }
                }}
                className={cn(
                    'flex-row items-center justify-between rounded-lg border p-4',
                    error
                        ? 'border-error'
                        : 'border-border dark:border-border-dark',
                    disabled && 'opacity-50',
                )}
            >
                <Text
                    style={textStyle}
                    variant={selectedValue ? 'default' : 'secondary'}
                >
                    {selectedOption?.label || t('common.select')}
                </Text>
                <Animated.View style={arrowAnimatedStyle}>
                    <ChevronDown
                        size={20}
                        color={colors.text}
                    />
                </Animated.View>
            </Pressable>

            {/* Helper Text or Error */}
            {(helperText || error) && (
                <Text
                    variant={error ? 'error' : 'secondary'}
                    size="sm"
                    className="mt-1"
                >
                    {error || helperText}
                </Text>
            )}

            {/* Options Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={() => setIsOpen(false)}
            >
                <Pressable
                    className="flex-1"
                    onPress={() => setIsOpen(false)}
                >
                    <View
                        className={cn(
                            'absolute rounded-lg border border-border bg-background p-1 shadow-lg dark:border-border-dark dark:bg-background-dark',
                        )}
                        style={{
                            top: buttonLayout.pageY + 4,
                            left: buttonLayout.pageX,
                            width: buttonLayout.width,
                            maxHeight: 200,
                        }}
                    >
                        <ScrollView bounces={false}>
                            {options.map((option) => (
                                <Pressable
                                    key={option.value}
                                    onPress={() => handleSelect(option)}
                                    className={cn(
                                        'p-3',
                                        option.disabled && 'opacity-50',
                                    )}
                                >
                                    <Text
                                        variant={
                                            option.value === selectedValue
                                                ? 'tint'
                                                : 'default'
                                        }
                                        className={option.disabled ? 'opacity-50' : ''}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    )
}