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
                const height = Platform.OS === 'ios' ? event.endCoordinates.height : event.endCoordinates.height;

                setKeyboardHeight(height);
                setIsKeyboardVisible(true);
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
