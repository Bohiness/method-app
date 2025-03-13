import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { MultilineTextInput } from '@shared/ui/text-input'
import React from 'react'
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native'

export interface UniversalScreenProps {
    /** Блок, который отображается в верхней части экрана (может содержать текст, код и т.п.) */
    topContent: React.ReactNode
    /** Значение текста, отображаемого в поле ввода */
    inputValue: string
    /** Обратный вызов изменения текста в поле ввода */
    onInputChange: (text: string) => void
    /** Плейсхолдер для текстового поля */
    placeholder?: string
}

export function UniversalScreen({
    topContent,
    inputValue,
    onInputChange,
    placeholder = 'Введите текст',
}: UniversalScreenProps) {
    const { dismissKeyboard } = useKeyboard()

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 px-4"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <Pressable className="flex-1" onPress={dismissKeyboard}>
                {/* Верхний блок для отображения переданного контента */}
                <View className="mt-4">
                    {topContent}
                </View>

                {/* Блок с полем ввода, который теперь идет сразу после topContent */}
                <View className="mt-2">
                    <MultilineTextInput
                        placeholder={placeholder}
                        multiline
                        onChangeText={onInputChange}
                        value={inputValue}
                        voiceInput
                    />
                </View>
            </Pressable>
        </KeyboardAvoidingView>
    )
}
