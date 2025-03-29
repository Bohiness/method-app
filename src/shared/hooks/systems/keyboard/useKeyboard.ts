import { logger } from '@shared/lib/logger/logger.service';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardEvent, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useKeyboard = () => {
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [contentHeight, setContentHeight] = useState(Dimensions.get('window').height);
    const inputRef = useRef<TextInput>(null);

    // Обновление размеров при изменении окна
    useEffect(() => {
        const updateContentHeight = () => {
            const screenHeight = Dimensions.get('window').height;
            setContentHeight(isKeyboardVisible ? screenHeight - keyboardHeight : screenHeight);
        };

        const dimensionsListener = Dimensions.addEventListener('change', updateContentHeight);

        return () => {
            dimensionsListener.remove();
        };
    }, [keyboardHeight, isKeyboardVisible]);

    // Обработка событий клавиатуры
    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event: KeyboardEvent) => {
                const height = event.endCoordinates.height;
                setKeyboardHeight(height);
                setIsKeyboardVisible(true);
                setContentHeight(Dimensions.get('window').height - height);
            }
        );

        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
                setContentHeight(Dimensions.get('window').height);
            }
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    // Показать клавиатуру
    const showKeyboard = useCallback(() => {
        logger.log('showKeyboard', 'useKeyboard –– useCallback');
        inputRef.current?.focus();
    }, []);

    // Скрыть клавиатуру
    const hideKeyboard = useCallback(() => {
        logger.log('hideKeyboard', 'useKeyboard –– useCallback');

        try {
            // Проверяем, есть ли у нас inputRef и он в фокусе
            if (inputRef.current) {
                inputRef.current.blur();
            }
        } catch (error) {
            logger.log('Error blurring input', 'useKeyboard –– hideKeyboard');
        }

        // Затем используем Keyboard.dismiss() для надежности
        Keyboard.dismiss();

        // Добавляем небольшую задержку перед обновлением состояния
        setTimeout(() => {
            setIsKeyboardVisible(false);
        }, 50);
    }, []);

    // Переключить видимость клавиатуры
    const toggleKeyboard = useCallback(() => {
        if (isKeyboardVisible) {
            logger.log('toggleKeyboard', 'hideKeyboard');
            hideKeyboard();
        } else {
            logger.log('toggleKeyboard', 'showKeyboard');
            showKeyboard();
        }
    }, [isKeyboardVisible, hideKeyboard, showKeyboard]);

    // Получить оптимальное поведение KeyboardAvoidingView для текущей платформы
    const getKeyboardBehavior = useCallback(() => {
        return Platform.OS === 'ios' ? 'padding' : 'height';
    }, []);

    return {
        keyboardHeight,
        contentHeight,
        isKeyboardVisible,
        showKeyboard,
        hideKeyboard,
        toggleKeyboard,
        getKeyboardBehavior,
        inputRef,
    };
};
