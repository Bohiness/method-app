// src/shared/hooks/systems/keyboard/useKeyboardStatus.ts
import { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'

export const useKeyboardStatus = () => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return isKeyboardVisible;
};
