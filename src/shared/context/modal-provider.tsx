import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Icon } from '@shared/ui/icon'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState
} from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../context/theme-provider'

interface ModalConfig {
    showCloseButton?: boolean
    backgroundColor?: string
}

interface ModalContextType {
    showModal: (content: ReactNode, config?: ModalConfig) => void
    hideModal: () => void
    hideAllModals: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

const defaultModalConfig: ModalConfig = {
    showCloseButton: true,
    backgroundColor: undefined
}

interface ModalStackItem {
    id: string
    content: ReactNode
    config: ModalConfig
}

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()
    const [modalStack, setModalStack] = useState<ModalStackItem[]>([])

    const activeModal = modalStack[modalStack.length - 1]

    const showModal = useCallback((content: ReactNode, config?: Partial<ModalConfig>) => {
        try {
            if (!content) {
                console.warn('Attempted to show modal without content')
                return
            }

            const finalConfig = { ...defaultModalConfig, ...config }

            // Создаем новый элемент стека
            const modalItem: ModalStackItem = {
                id: Date.now().toString(),
                content,
                config: finalConfig
            }

            console.log('Добавляем модальное окно в стек:', modalItem.id)
            setModalStack(prev => [...prev, modalItem])
        } catch (error) {
            console.error('Ошибка при открытии модального окна:', error)
        }
    }, [])

    const hideModal = useCallback(() => {
        if (modalStack.length === 0) return
        setModalStack(prev => prev.slice(0, -1))
    }, [modalStack.length])

    const hideAllModals = useCallback(() => {
        setModalStack([])
    }, [])

    return (
        <ModalContext.Provider value={{ showModal, hideModal, hideAllModals }}>
            {children}
            <Modal
                visible={modalStack.length > 0}
                animationType="slide"
                transparent={true}
                onRequestClose={hideModal}
                statusBarTranslucent={true}
            >
                {activeModal && (
                    <View style={[
                        styles.modalContainer,
                        { backgroundColor: activeModal.config.backgroundColor || colors.background }
                    ]}>
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
                        <View style={styles.contentContainer}>
                            {activeModal.content}
                        </View>
                    </View>
                )}
            </Modal>
        </ModalContext.Provider>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    contentContainer: {
        flex: 1,
        width: '100%'
    }
})

export const useModal = () => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within ModalProvider')
    }
    return context
}