// src/shared/hooks/modal/useModalScroll.ts
import { useModal } from '@shared/context/modal-provider'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

interface UseModalScrollOptions {
    paddingToBottom?: number
    onClose?: () => void
}
/**
 * Options for the useModalScroll hook.
 * @interface UseModalScrollOptions
 * @property {number} [paddingToBottom=20] - The padding to the bottom of the scroll view before triggering the close action.
 * @property {() => void} [onClose] - Optional callback function to be called when the modal is closed.
 */
export const useModalScroll = (options: UseModalScrollOptions = {}) => {
    const { hideBottomSheet } = useModal()
    const { paddingToBottom = 20, onClose } = options

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent

        const isCloseToBottom = layoutMeasurement.height + contentOffset.y 
            >= contentSize.height - paddingToBottom

        if (isCloseToBottom && contentOffset.y > 0) {
            hideBottomSheet()
            onClose?.()
        }
    }

    return {
        handleScroll,
        scrollProps: {
            onScroll: handleScroll,
            scrollEventThrottle: 16,
            bounces: false
        }
    }
}



/**
 * // С дополнительными опциями
const { scrollProps } = useModalScroll({
    paddingToBottom: 30,
    onClose: () => {
        // Дополнительные действия при закрытии
    }
});

// В компоненте
    <ScrollView {...scrollProps}></ScrollView>
 */