import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView
} from '@gorhom/bottom-sheet'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Icon } from '@shared/ui/icon'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useRef,
    useState
} from 'react'
import { View } from 'react-native'
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../context/theme-provider'

type ModalType = 'bottomSheet' | 'fullScreen'

interface ModalConfig {
    type: ModalType
    snapPoints?: string[]
    showCloseButton?: boolean
    enableDynamicSizing?: boolean
    showHandleIndicator?: boolean
    backgroundColor?: string
    closeBySwipeEnabled?: boolean
}

interface ModalContextType {
    showModal: (content: ReactNode, config?: ModalConfig) => void
    hideModal: () => void
    hideAllModals: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

const defaultBottomSheetConfig: ModalConfig = {
    type: 'bottomSheet',
    snapPoints: ['90%'],
    showCloseButton: false,
    enableDynamicSizing: false,
    showHandleIndicator: true,
    closeBySwipeEnabled: true
}

const defaultFullScreenConfig: ModalConfig = {
    type: 'fullScreen',
    snapPoints: ['100%'],
    showCloseButton: true,
    enableDynamicSizing: false,
    showHandleIndicator: false,
    closeBySwipeEnabled: false
}

interface ModalStackItem {
    id: string
    content: ReactNode
    config: ModalConfig
}

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const bottomSheetRef = useRef<BottomSheet>(null)
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()
    const animatedPosition = useSharedValue(-1)
    const [modalStack, setModalStack] = useState<ModalStackItem[]>([])
    const [index, setIndex] = useState(-1)

    const animatedStyle = useAnimatedStyle(() => {
        // Инвертируем значения для более плавной анимации
        const scale = interpolate(
            animatedPosition.value,
            [-1, 0],
            [1, 0.95],
            Extrapolate.CLAMP
        )

        return {
            transform: [{ scale }]
        }
    })

    const activeModal = modalStack[modalStack.length - 1]

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges вызван с индексом:', index)
        console.log('Текущий размер стека модальных окон:', modalStack.length)

        if (index === -1 && modalStack.length > 0) {
            console.log('Закрытие модального окна, добавляем задержку...')
            // Добавляем задержку перед обновлением стека
            setTimeout(() => {
                console.log('Таймаут сработал, обновляем стек...')
                setModalStack(prev => {
                    console.log('Предыдущий стек:', prev)
                    const newStack = prev.slice(0, -1)
                    console.log('Новый стек:', newStack)
                    return newStack
                })
                setIndex(-1)
                console.log('Индекс сброшен в -1')
            }, 100) // Подстройте значение при необходимости
        } else {
            console.log('Обновляем индекс на:', index)
            setIndex(index)
        }
    }, [modalStack.length])

    const showModal = useCallback((content: ReactNode, config?: Partial<ModalConfig>) => {
        try {
            console.log('showModal вызван с конфигурацией:', config)

            if (!content) {
                console.warn('Attempted to show modal without content')
                return
            }

            const baseConfig = config?.type === 'fullScreen' ?
                defaultFullScreenConfig :
                defaultBottomSheetConfig
            const finalConfig = { ...baseConfig, ...config }

            console.log('Итоговая конфигурация модального окна:', finalConfig)

            // Создаем новый элемент стека
            const modalItem: ModalStackItem = {
                id: Date.now().toString(),
                content,
                config: finalConfig
            }

            console.log('Создан новый элемент стека:', modalItem)

            // Если открывается fullscreen, закрываем все предыдущие
            if (finalConfig.type === 'fullScreen') {
                console.log('Открывается fullscreen модальное окно, очищаем стек', modalItem)
                setModalStack([modalItem])
            } else {
                console.log('Добавляем модальное окно в стек', modalItem)
                setModalStack(prev => [...prev, modalItem])
            }

            setIndex(0)
            bottomSheetRef.current?.snapToIndex(0)
            console.log('Анимируем открытие модального окна, стек:', modalStack)
        } catch (error) {
            console.error('Ошибка при открытии модального окна:', error)
        }
    }, [])

    const hideModal = useCallback(() => {
        if (modalStack.length === 0) return

        // Анимируем закрытие
        bottomSheetRef.current?.close()

        // Обновляем стек после завершения анимации
        if (modalStack.length === 1) {
            setTimeout(() => {
                setIndex(-1)
                setModalStack([])
            }, 100)
        } else {
            setModalStack(prev => prev.slice(0, -1))
            requestAnimationFrame(() => {
                setIndex(0)
                bottomSheetRef.current?.snapToIndex(0)
            })
        }
    }, [modalStack.length])

    const hideAllModals = useCallback(() => {
        setModalStack([])
        bottomSheetRef.current?.close()
        setIndex(-1)
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
        <ModalContext.Provider value={{ showModal, hideModal, hideAllModals }}>
            <Animated.View className="flex-1" style={animatedStyle}>
                {children}
            </Animated.View>
            {activeModal && (
                <BottomSheet
                    ref={bottomSheetRef}
                    index={index}
                    snapPoints={activeModal.config.snapPoints}
                    enableDynamicSizing={activeModal.config.enableDynamicSizing}
                    onChange={handleSheetChanges}
                    enablePanDownToClose={activeModal.config.closeBySwipeEnabled}
                    backdropComponent={renderBackdrop}
                    animatedIndex={animatedPosition}
                    animationConfigs={{
                        mass: 1,
                        damping: 15,
                        stiffness: 150,
                        overshootClamping: false,
                        restDisplacementThreshold: 0.01,
                        restSpeedThreshold: 0.01,
                    }}
                    backgroundStyle={{
                        backgroundColor: activeModal.config.backgroundColor || colors.background
                    }}
                    handleIndicatorStyle={{
                        width: 40,
                        backgroundColor: colors.border,
                        display: activeModal.config.showHandleIndicator ? 'flex' : 'none'
                    }}
                    handleStyle={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        display: activeModal.config.showHandleIndicator ? 'flex' : 'none'
                    }}
                    enableContentPanningGesture={false}
                    enableHandlePanningGesture
                    animateOnMount
                    enableOverDrag={false}
                >
                    <BottomSheetView style={{ flex: 1, width: '100%' }}>
                        {activeModal.config.showCloseButton && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: insets.top + 8,
                                    right: insets.right + 16,
                                    zIndex: 50
                                }}
                            >
                                <HapticTab
                                    onPress={hideModal}
                                    className="w-10 h-10 items-center justify-center"
                                >
                                    <Icon
                                        name="X"
                                        size={24}
                                        variant="default"
                                    />
                                </HapticTab>
                            </View>
                        )}
                        <View className="flex-1">
                            {activeModal.content}
                        </View>
                    </BottomSheetView>
                </BottomSheet>
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