// src/shared/lib/modal/modal-provider.tsx
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView
} from '@gorhom/bottom-sheet'
import { useColorScheme } from '@shared/hooks/systems/colors/useColorScheme'
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState
} from 'react'

interface ModalContextType {
    showBottomSheet: (content: ReactNode) => void
    hideBottomSheet: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const bottomSheetRef = useRef<BottomSheet>(null)
    const [content, setContent] = useState<ReactNode | null>(null)
    const colorScheme = useColorScheme()

    // Определяем фиксированные точки привязки
    const snapPoints = useMemo(() => ['50%', '90%'], [])
    const [index, setIndex] = useState(-1)

    const showBottomSheet = useCallback((content: ReactNode) => {
        setContent(content)
        setIndex(0)
        bottomSheetRef.current?.snapToIndex(0)
    }, [])

    const hideBottomSheet = useCallback(() => {
        bottomSheetRef.current?.close()
        setContent(null)
        setIndex(-1)
    }, [])

    const handleSheetChanges = useCallback((index: number) => {
        setIndex(index)
        console.log('handleSheetChanges', index)
        if (index === -1) {
            setContent(null)
        }
    }, [])

    // Конфигурация backdrop
    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
        />
    ), [])

    return (
        <ModalContext.Provider value={{ showBottomSheet, hideBottomSheet }}>
            {children}
            <BottomSheet
                ref={bottomSheetRef}
                index={index}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={{
                }}
                handleIndicatorStyle={{
                    width: 40,
                }}
                handleStyle={{
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                }}
                enableContentPanningGesture
                enableHandlePanningGesture
                animateOnMount
            >
                <BottomSheetView
                    style={{
                        flex: 1,
                        padding: 16,
                    }}
                >
                    {content}
                </BottomSheetView>
            </BottomSheet>
        </ModalContext.Provider>
    )
}

export const useModal = () => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within ModalProvider')
    }
    return context
}