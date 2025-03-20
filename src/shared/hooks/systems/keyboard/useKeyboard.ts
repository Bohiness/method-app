import { logger } from '@shared/lib/logger/logger.service';
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useKeyboard = () => {
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event: KeyboardEvent) => {
                const suggestionBarHeight = Platform.OS === 'ios' ? 0 : 0;
                const height = event.endCoordinates.height + suggestionBarHeight;

                setKeyboardHeight(height);
                setIsKeyboardVisible(true);
                logger.log(height, 'useKeyboard –– useEffect');
            }
        );

        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
            }
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return {
        keyboardHeight,
        isKeyboardVisible,
        dismissKeyboard: Keyboard.dismiss,
    };
};
