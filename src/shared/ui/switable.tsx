import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    WithTimingConfig,
} from 'react-native-reanimated'
import { View } from './view'

// Конфигурация анимации по умолчанию
const DEFAULT_ANIMATION_CONFIG: WithTimingConfig = {
    duration: 300,
    // Можно добавить easing: Easing.bezier(...) если нужно
}

// Определяем типы для props
interface SwitableProps {
    front: React.ReactNode // Первый видимый элемент
    back: React.ReactNode  // Второй скрытый элемент
    initialIndex?: 0 | 1 // Начальный индекс
    animationConfig?: WithTimingConfig // Конфигурация анимации
    gesturesEnabled?: boolean // Включены ли жесты
    gestureActivationThreshold?: number // Порог активации свайпа (0.0 до 1.0)
    onSwitchComplete?: (index: 0 | 1) => void // Коллбэк после завершения
}

// Определяем тип для ref, чтобы родитель мог вызывать методы
export interface SwitableRef {
    switchToBack: (config?: WithTimingConfig) => void
    switchToFront: (config?: WithTimingConfig) => void
    activeIndex: SharedValue<number>
    hasRenderedBackOnce: boolean
    getCurrentIndex: () => 0 | 1
}
/**
 * Компонент для переключения между двумя экранами с анимацией и опциональной отложенной загрузкой второго экрана.
 * @param front - Первый экран
 * @param back - Второй экран
 * @param initialIndex - Начальный индекс (0 - front, 1 - back)
 * @param animationConfig - Конфигурация анимации
 * @param gesturesEnabled - Включены ли жесты (по умолчанию false)
 * @param gestureActivationThreshold - Порог активации свайпа (0.0 до 1.0)
 * @param onSwitchComplete - Коллбэк после завершения переключения
 */

export const Switable = forwardRef<SwitableRef, SwitableProps>(
    (
        {
            front,
            back,
            initialIndex = 0,
            animationConfig = DEFAULT_ANIMATION_CONFIG,
            gesturesEnabled = false,
            gestureActivationThreshold = 0.3, // 30% ширины для переключения
            onSwitchComplete,
        },
        ref
    ) => {
        // Состояние для хранения ширины контейнера
        const [layoutWidth, setLayoutWidth] = useState(0)
        // Состояние, чтобы рендерить 'back' только после первого запроса на его отображение
        const [hasRenderedBackOnce, setHasRenderedBackOnce] = useState(initialIndex === 1)
        // Shared value для отслеживания активного индекса (0 - front, 1 - back)
        const activeIndex = useSharedValue(initialIndex)
        const translateXOffset = useSharedValue(0) // Смещение для жеста
        const isGestureActive = useSharedValue(false) // Флаг активности жеста

        // Обработчик onLayout для получения ширины
        const handleLayout = (event: LayoutChangeEvent) => {
            setLayoutWidth(event.nativeEvent.layout.width)
        }

        // Функция для установки флага рендеринга 'back'
        const ensureBackIsRendered = useCallback(() => {
            if (!hasRenderedBackOnce) {
                setHasRenderedBackOnce(true)
            }
        }, [hasRenderedBackOnce])

        // Функция для безопасного вызова коллбэка из UI потока
        const callOnSwitchComplete = useCallback((index: 0 | 1) => {
            if (onSwitchComplete) {
                onSwitchComplete(index)
            }
        }, [onSwitchComplete])

        // Функция для анимированного переключения индекса
        const switchIndex = (index: 0 | 1, config: WithTimingConfig = animationConfig) => {
            if (layoutWidth <= 0) return

            // Если переключаемся на 'back', убедимся, что он отрендерен
            if (index === 1) {
                runOnJS(ensureBackIsRendered)()
            }

            translateXOffset.value = 0 // Сбрасываем смещение жеста перед анимацией индекса
            activeIndex.value = withTiming(index, config, (finished) => {
                // Вызываем коллбэк после завершения анимации
                if (finished) {
                    runOnJS(callOnSwitchComplete)(index)
                }
                isGestureActive.value = false // Сброс флага жеста после анимации (на всякий случай)
            })
        }

        // Предоставляем методы и activeIndex для управления через ref
        useImperativeHandle(ref, () => ({
            switchToBack: (config?: WithTimingConfig) => {
                // Перед началом анимации убедимся, что back отрендерен
                ensureBackIsRendered()
                // Небольшая задержка, чтобы React успел отрендерить back перед анимацией, если его не было
                setTimeout(() => {
                    switchIndex(1, config ?? animationConfig)
                }, 0)
            },
            switchToFront: (config?: WithTimingConfig) => {
                switchIndex(0, config ?? animationConfig)
            },
            activeIndex: activeIndex as SharedValue<number>,
            hasRenderedBackOnce: hasRenderedBackOnce,
            getCurrentIndex: () => {
                return activeIndex.value as 0 | 1
            },
        }), [ensureBackIsRendered, activeIndex, animationConfig, hasRenderedBackOnce])

        // Жест панорамирования (свайп)
        const panGesture = Gesture.Pan()
            .enabled(gesturesEnabled && layoutWidth > 0) // Включаем только если разрешено и ширина известна
            .onStart(() => {
                isGestureActive.value = true
            })
            .onUpdate((event) => {
                // Ограничиваем смещение: нельзя свайпнуть влево на первом экране и вправо на втором
                const newTranslateX = event.translationX
                if (activeIndex.value === 0 && newTranslateX < 0) {
                    translateXOffset.value = newTranslateX
                    // Если свайпаем к 'back', который еще не отрендерен, рендерим его
                    if (!hasRenderedBackOnce) {
                        runOnJS(ensureBackIsRendered)()
                    }
                } else if (activeIndex.value === 1 && newTranslateX > 0) {
                    translateXOffset.value = newTranslateX
                } else {
                    // Уменьшаем сопротивление при свайпе в "неправильную" сторону
                    translateXOffset.value = newTranslateX / 4
                }
            })
            .onEnd((event) => {
                const threshold = layoutWidth * gestureActivationThreshold
                const velocityThreshold = 500 // Порог скорости для активации

                // Определяем, нужно ли переключать экран
                let shouldSwitch = false
                let newIndex: 0 | 1 = activeIndex.value as 0 | 1

                if (activeIndex.value === 0 && (event.translationX < -threshold || event.velocityX < -velocityThreshold)) {
                    shouldSwitch = true
                    newIndex = 1
                } else if (activeIndex.value === 1 && (event.translationX > threshold || event.velocityX > velocityThreshold)) {
                    shouldSwitch = true
                    newIndex = 0
                }

                if (shouldSwitch) {
                    switchIndex(newIndex, animationConfig) // Завершаем анимацию к новому индексу
                } else {
                    // Возвращаем смещение в 0, если свайп не активировал переключение
                    translateXOffset.value = withTiming(0, animationConfig, () => {
                        isGestureActive.value = false // Сбрасываем флаг жеста после анимации возврата
                    })
                }
                // Не сбрасываем isGestureActive здесь, т.к. анимация (switchIndex или возврат) еще идет
            })
            .failOffsetX([-5, 5]) // Небольшой допуск, чтобы не конфликтовать с вертикальным скроллом

        // Анимированный стиль для первого элемента (front)
        const frontAnimatedStyle = useAnimatedStyle(() => {
            const currentTranslateX = interpolate(
                activeIndex.value,
                [0, 1],
                [0, -layoutWidth],
                Extrapolate.CLAMP
            )
            // Добавляем смещение жеста, только если layoutWidth > 0
            const totalTranslateX = layoutWidth > 0 ? currentTranslateX + translateXOffset.value : 0

            return {
                transform: [{ translateX: totalTranslateX }],
                // Отключаем взаимодействие, если неактивен и не во время жеста
                pointerEvents: activeIndex.value === 0 && !isGestureActive.value ? 'auto' : 'none',
            }
        })

        // Этот стиль будет создан только когда hasRenderedBackOnce станет true
        const backAnimatedStyle = useAnimatedStyle(() => {
            // Если layoutWidth еще 0, позиционируем за экраном, чтобы избежать мигания
            const initialPosition = layoutWidth > 0 ? layoutWidth : 10000
            const currentTranslateX = interpolate(
                activeIndex.value,
                [0, 1],
                [initialPosition, 0],
                Extrapolate.CLAMP
            )
            // Добавляем смещение жеста только если layoutWidth > 0
            const totalTranslateX = layoutWidth > 0 ? currentTranslateX + translateXOffset.value : initialPosition

            return {
                transform: [{ translateX: totalTranslateX }],
                // Отключаем взаимодействие, если неактивен и не во время жеста
                pointerEvents: activeIndex.value === 1 && !isGestureActive.value ? 'auto' : 'none',
            }
        }, [layoutWidth]) // Добавляем layoutWidth в зависимости, чтобы пересчитать initialPosition

        // Стиль для абсолютного позиционирования второго элемента поверх первого
        // Определяем стиль явно, чтобы удовлетворить типизацию Animated.View
        const absoluteFillStyle: Animated.AnimateStyle<ViewStyle> = {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%', // Явно указываем строковое значение для ширины
            height: '100%', // Добавляем высоту для полноты
        }

        return (
            // Оборачиваем в GestureDetector
            <GestureDetector gesture={panGesture}>
                <View
                    variant='transparent'
                    onLayout={handleLayout}
                    style={styles.container}
                    className="relative"
                >
                    {/* Используем Animated.View для pointerEvents */}
                    <Animated.View style={[styles.animatedView, frontAnimatedStyle]}>
                        {front}
                    </Animated.View>
                    {/* Рендерим back только если hasRenderedBackOnce true */}
                    {hasRenderedBackOnce && (
                        <Animated.View style={[absoluteFillStyle, styles.animatedView, backAnimatedStyle]}>
                            {back}
                        </Animated.View>
                    )}
                </View>
            </GestureDetector>
        )
    }
)

// Стили для компонента
const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    animatedView: {
        position: 'absolute', // Делаем оба view абсолютными для наложения
        width: '100%',
        height: '100%',
    },
})

Switable.displayName = 'Switable'