// src/shared/lib/modal/modal-provider.tsx
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView
} from '@gorhom/bottom-sheet'
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState
} from 'react'
import { View } from 'react-native'
import { useColorScheme } from './theme-provider'

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
    const snapPoints = useMemo(() => ['90%'], [])
    const [index, setIndex] = useState(-1)

    const showBottomSheet = useCallback((content: ReactNode) => {
        setContent(content)
        setIndex(0)
        // Принудительно раскрываем на 90%
        bottomSheetRef.current?.snapToIndex(0)
    }, [])

    const hideBottomSheet = useCallback(() => {
        bottomSheetRef.current?.close()
        setContent(null)
        setIndex(-1)
    }, [])

    const handleSheetChanges = useCallback((index: number) => {
        setIndex(index)
        if (index === -1) {
            setContent(null)
        }
    }, [])

    const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
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
                enableDynamicSizing={false}
                onChange={handleSheetChanges}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={{
                    backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF'
                }}
                handleIndicatorStyle={{
                    width: 40,
                    backgroundColor: colorScheme === 'dark' ? '#404040' : '#E5E7EB'
                }}
                handleStyle={{
                    backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
                    borderColor: colorScheme === 'dark' ? '#404040' : '#E5E7EB',
                    borderRadius: 16,
                }}
                enableContentPanningGesture
                enableHandlePanningGesture
                animateOnMount
                enableOverDrag={false}
            >
                <BottomSheetView
                    style={{
                        flex: 1,
                        width: '100%'
                    }}
                >
                    <View className="px-4 pt-2 pb-8 flex-1">
                        {content}
                    </View>
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