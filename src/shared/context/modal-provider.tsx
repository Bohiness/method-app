// src/shared/lib/modal/modal-provider.tsx
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView
} from '@gorhom/bottom-sheet'
import { FullScreenModal } from '@shared/ui/modals/fullscreen-modal'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState
} from 'react'
import { View } from 'react-native'
import { useTheme } from './theme-provider'

interface ModalContextType {
    showBottomSheet: (content: ReactNode) => void
    hideBottomSheet: () => void
    showFullScreenModal: (content: ReactNode) => void
    hideFullScreenModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const bottomSheetRef = useRef<BottomSheet>(null)
    const [bottomSheetContent, setBottomSheetContent] = useState<ReactNode | null>(null)
    const [fullScreenContent, setFullScreenContent] = useState<ReactNode | null>(null)
    const [isFullScreenVisible, setIsFullScreenVisible] = useState(false)
    const { isDark, colors } = useTheme()
    const snapPoints = useMemo(() => ['90%'], [])
    const [index, setIndex] = useState(-1)
    const modalIdRef = useRef(0)

    const showBottomSheet = useCallback((content: ReactNode) => {
        if (!content) {
            console.warn('Attempted to show BottomSheet without content')
            return
        }
        setBottomSheetContent(content)
        setIndex(0)
        bottomSheetRef.current?.snapToIndex(0)
    }, [])

    const hideBottomSheet = useCallback(() => {
        console.log('Hiding BottomSheet')
        bottomSheetRef.current?.close()
        setBottomSheetContent(null)
        setIndex(-1)
    }, [])

    const showFullScreenModal = useCallback((content: ReactNode) => {
        if (!content) {
            console.warn('Attempted to show FullScreenModal without content')
            return
        }
        setFullScreenContent(content)
        setIsFullScreenVisible(true)
        modalIdRef.current += 1
    }, [])

    const hideFullScreenModal = useCallback(() => {
        setIsFullScreenVisible(false)
        setTimeout(() => {
            setFullScreenContent(null)
        }, 300)
    }, [])

    const handleSheetChanges = useCallback((index: number) => {
        console.log('BottomSheet index changed to:', index)
        setIndex(index)
        if (index === -1) {
            setBottomSheetContent(null)
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
        <ModalContext.Provider value={{
            showBottomSheet,
            hideBottomSheet,
            showFullScreenModal,
            hideFullScreenModal
        }}>
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
                    backgroundColor: colors.background
                }}
                handleIndicatorStyle={{
                    width: 40,
                    backgroundColor: colors.border
                }}
                handleStyle={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
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
                        {bottomSheetContent}
                    </View>
                </BottomSheetView>
            </BottomSheet>

            {fullScreenContent && (
                <FullScreenModal
                    key={modalIdRef.current}
                    isVisible={isFullScreenVisible}
                    onClose={hideFullScreenModal}
                    showCloseButton={true}
                >
                    {fullScreenContent}
                </FullScreenModal>
            )}
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