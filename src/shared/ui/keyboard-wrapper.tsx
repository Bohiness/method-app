import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import React, { forwardRef, useImperativeHandle, useMemo } from 'react'
import { KeyboardAvoidingView, StyleSheet, ViewProps } from 'react-native'

export interface KeyboardWrapperProps extends ViewProps {
    children: React.ReactNode
    behavior?: 'height' | 'position' | 'padding'
    keyboardVerticalOffset?: number
    className?: string
    variant?: 'default' | 'paper' | 'canvas' | 'stone' | 'inverse' | 'transparent'
    enabled?: boolean
    /**
     * Если true, то контент будет адаптироваться под высоту клавиатуры
     * Если false, то будет использован стандартный механизм KeyboardAvoidingView
     */
    useContentHeight?: boolean
}

export interface KeyboardWrapperRef {
    showKeyboard: () => void
    hideKeyboard: () => void
    isKeyboardVisible: boolean
    keyboardHeight: number
    contentHeight: number
}

/**
 * Компонент-обертка для работы с клавиатурой
 * Предоставляет методы для отображения и скрытия клавиатуры
 * Использует KeyboardAvoidingView для автоматической адаптации под клавиатуру
 */
const KeyboardWrapper = forwardRef<KeyboardWrapperRef, KeyboardWrapperProps>(
    ({
        children,
        behavior,
        keyboardVerticalOffset = 0,
        className = '',
        variant = 'transparent',
        enabled = true,
        useContentHeight = false,
        style,
        ...props
    }, ref) => {

        const {
            keyboardHeight,
            isKeyboardVisible,
            showKeyboard,
            hideKeyboard,
            getKeyboardBehavior,
            contentHeight
        } = useKeyboard()

        // Предоставляем методы родительским компонентам
        useImperativeHandle(ref, () => ({
            showKeyboard,
            hideKeyboard,
            isKeyboardVisible,
            keyboardHeight,
            contentHeight
        }))

        // Вычисляем стили контейнера с учетом флага useContentHeight
        const containerStyle = useMemo(() => {
            if (useContentHeight) {
                return [
                    styles.container,
                    { height: contentHeight },
                    style
                ]
            }
            return [styles.container, style]
        }, [useContentHeight, contentHeight, style])

        return (
            <KeyboardAvoidingView
                behavior={!useContentHeight ? (behavior || getKeyboardBehavior()) : undefined}
                keyboardVerticalOffset={keyboardVerticalOffset}
                enabled={enabled && !useContentHeight}
                style={containerStyle}
                contentContainerStyle={styles.contentContainer}
            >
                {children}
            </KeyboardAvoidingView>
        )
    }
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    }
})

export { KeyboardWrapper }
