import { BottomModalHeader } from '@shared/ui/modals/BottomModalHeader'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { BackHandler } from 'react-native'
import { View } from '../../ui/view'

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

// Типы высоты модального окна
export type ModalHeight = 'content' | 'full' | number

// Конфигурация модального окна
interface ModalConfig {
    showCloseButton?: boolean
    backgroundColor?: string
    onClose?: () => void
    height?: ModalHeight // Добавляем настройку высоты
    snapPoints?: string[] // Точки привязки для BottomSheet
    titleLeftComponent?: ReactNode
}

// Тип для контента - может быть React-элементом или функцией, возвращающей React-элемент
export type ModalContent = ReactNode | (() => ReactNode)

// Создаем интерфейс для хука
interface UseModalResult {
    visible: boolean
    showModal: ({ content, config, titleLeftComponent }: { content: ModalContent, config?: ModalConfig, titleLeftComponent?: ReactNode | (() => ReactNode) }) => void
    hideModal: (onCloseCallback?: () => void) => void
    updateModal: (updates?: { content?: ModalContent, config?: Partial<ModalConfig>, titleLeftComponent?: ReactNode | (() => ReactNode) }) => void
    ModalComponent: ({ onCloseCallback }: { onCloseCallback?: () => void }) => JSX.Element | null
}

export const useShowModal = (): UseModalResult => {
    const [visible, setVisible] = useState(false)
    const [content, setContent] = useState<ModalContent | null>(null)
    const [titleLeftComponent, setTitleLeftComponent] = useState<ReactNode | (() => ReactNode) | null>(null)
    const [config, setConfig] = useState<ModalConfig>({
        showCloseButton: true,
        backgroundColor: undefined,
        onClose: undefined,
        height: 'content',
        snapPoints: undefined
    })

    // Добавляем счетчик обновлений для принудительного ререндеринга
    const [updateCounter, setUpdateCounter] = useState(0)

    // Референс для BottomSheet
    const bottomSheetRef = useRef<BottomSheet>(null)


    // Обработка нажатия кнопки "Назад" на Android
    useEffect(() => {
        if (!visible) return

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (visible) {
                hideModal()
                return true
            }
            return false
        })

        return () => backHandler.remove()
    }, [visible])

    const showModal = useCallback(({ content, config, titleLeftComponent }: { content: ModalContent, config?: ModalConfig, titleLeftComponent?: ReactNode | (() => ReactNode) }) => {
        if (!content) {
            console.warn('Attempted to show modal without content')
            return
        }

        setContent(content)
        setConfig(prev => ({ ...prev, ...config }))
        setTitleLeftComponent(titleLeftComponent)
        setVisible(true)

        // Открываем BottomSheet с анимацией
        setTimeout(() => {
            bottomSheetRef.current?.snapToIndex(0)
        }, 100)
    }, [])

    // Функция для обновления модального окна без его закрытия и повторного открытия
    const updateModal = useCallback((updates?: {
        content?: ModalContent,
        config?: Partial<ModalConfig>,
        titleLeftComponent?: ReactNode | (() => ReactNode)
    }) => {
        if (!visible) {
            console.warn('Attempted to update modal that is not visible')
            return
        }

        if (updates?.content) {
            setContent(updates.content)
        }

        if (updates?.config) {
            setConfig(prev => ({ ...prev, ...updates.config }))
        }

        if (updates?.titleLeftComponent) {
            setTitleLeftComponent(updates.titleLeftComponent)
        }

        // Увеличиваем счетчик обновлений для принудительного ререндеринга
        setUpdateCounter(prev => prev + 1)
    }, [visible])

    const hideModal = useCallback((onCloseCallback?: () => void) => {
        // Закрываем BottomSheet
        bottomSheetRef.current?.close()

        // Немного задержки перед скрытием контента
        setTimeout(() => {
            setVisible(false)

            // Выполняем переданную функцию обратного вызова, если она есть
            if (onCloseCallback) {
                onCloseCallback()
            }

            // Выполним пользовательский onClose из конфига, если он есть
            if (config.onClose) {
                config.onClose()
            }
        }, 300)
    }, [config.onClose])

    // Обработчик изменения индекса BottomSheet
    const handleSheetChanges = useCallback((index: number) => {
        // Если индекс -1, значит BottomSheet закрыт
        if (index === -1) {
            setVisible(false)
            if (config.onClose) {
                config.onClose()
            }
        }
    }, [config.onClose])

    // Функция для рендеринга контента
    const renderContent = useCallback(() => {
        if (typeof content === 'function') {
            return content()
        }
        return content
    }, [content, updateCounter]) // Добавляем updateCounter в зависимости

    // Функция для рендеринга левого компонента заголовка
    const renderTitleLeftComponent = useCallback(() => {
        if (typeof titleLeftComponent === 'function') {
            return titleLeftComponent()
        }
        return titleLeftComponent
    }, [titleLeftComponent, updateCounter]) // Добавляем updateCounter в зависимости

    // Компонент модального окна
    const ModalComponent = () => {
        if (!visible || !content) return null

        return (
            <View className="absolute inset-0 z-50">
                <View
                    className="absolute inset-0"
                    onTouchEnd={() => hideModal()}
                />
                <BottomSheet
                    ref={bottomSheetRef}
                    onChange={handleSheetChanges}
                    enablePanDownToClose={true}
                    backgroundStyle={{ backgroundColor: 'transparent' }}
                    handleComponent={() => <BottomModalHeader showCloseButton={config.showCloseButton} onClose={hideModal} titleLeftComponent={renderTitleLeftComponent()} />}
                >
                    <BottomSheetView className="flex-1">
                        <View
                            variant="default"
                            className={`flex-1 w-full ${config.backgroundColor || ''}`}
                        >
                            <View className="flex-1 w-full">
                                {renderContent()}
                            </View>
                        </View>
                    </BottomSheetView>
                </BottomSheet>
            </View>
        )
    }

    return {
        visible,
        showModal,
        hideModal,
        updateModal,
        ModalComponent
    }
} 