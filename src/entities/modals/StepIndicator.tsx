// src/features/diary/mood/components/StepIndicator.tsx
import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated'

export interface StepIndicatorProps {
    currentStep: number
    totalSteps?: number
    onStepPress?: (step: number) => void
}

// Разделяем константы для расчёта позиций анимированного элемента и для визуального отображения точек.
const CELL_WIDTH_ANIM = 18         // Используется для вычислений позиции анимированного элемента (капли)
const CELL_WIDTH_DISPLAY = 12      // Используется для визуального расположения точек (расстояние между ними меньше)
const DROPLET_WIDTH = 12
const DROPLET_HEIGHT = 6
// Отступ для центрирования анимированного элемента внутри ячейки (CELL_WIDTH_ANIM)
const DROPLET_OFFSET = (CELL_WIDTH_ANIM - DROPLET_WIDTH) / 2
const DOT_SIZE = 6                 // Размер статичной точки

export function StepIndicator({
    currentStep,
    totalSteps = 3,
    onStepPress,
}: StepIndicatorProps) {
    // Состояние для хранения предыдущего шага до окончания анимации
    const [prevStep, setPrevStep] = useState(currentStep || 1)
    const [animating, setAnimating] = useState(false)

    // splitProgress изначально 1 (капля на месте)
    const splitProgress = useSharedValue(1)
    const startX = useSharedValue(((currentStep || 1) - 1) * CELL_WIDTH_ANIM + DROPLET_OFFSET)
    const targetX = useSharedValue(((currentStep || 1) - 1) * CELL_WIDTH_ANIM + DROPLET_OFFSET)

    // Функция завершения анимации, вызываемая через runOnJS
    const finishAnimation = (newStep: number) => {
        setPrevStep(newStep)
        setAnimating(false)
    }

    useEffect(() => {
        // Если шаг не изменился или не определен — ничего не делаем
        if (currentStep === prevStep || currentStep === undefined) return

        const newStep = currentStep

        setAnimating(true)
        startX.value = (prevStep - 1) * CELL_WIDTH_ANIM + DROPLET_OFFSET
        targetX.value = withSpring((newStep - 1) * CELL_WIDTH_ANIM + DROPLET_OFFSET, {
            stiffness: 200,
            damping: 20,
        })

        // Сбрасываем splitProgress до 0 и анимируем до 1 (300 мс)
        splitProgress.value = 0
        splitProgress.value = withTiming(1, { duration: 300 }, () => {
            runOnJS(finishAnimation)(newStep)
        })
    }, [currentStep, prevStep, splitProgress, startX, targetX])

    // Анимация для двух частей капли с условием по направлению
    const leftPartStyle = useAnimatedStyle(() => {
        if (targetX.value >= startX.value) {
            // Если двигаемся вправо, левая часть остаётся неподвижной и плавно растворяется
            const opacity = interpolate(splitProgress.value, [0, 1], [1, 0])
            return {
                position: 'absolute',
                left: startX.value,
                width: DROPLET_WIDTH / 2,
                height: DROPLET_HEIGHT,
                backgroundColor: '#757575',
                borderRadius: 3,
                opacity,
                zIndex: 10,
            }
        } else {
            // Если двигаемся влево, левая часть – это движущаяся, расширяющаяся часть капли:
            const left = interpolate(splitProgress.value, [0, 1], [startX.value, targetX.value])
            const width = interpolate(splitProgress.value, [0, 1], [DROPLET_WIDTH / 2, DROPLET_WIDTH])
            return {
                position: 'absolute',
                left,
                width,
                height: DROPLET_HEIGHT,
                backgroundColor: '#757575',
                borderRadius: 3,
                zIndex: 10,
            }
        }
    })

    const rightPartStyle = useAnimatedStyle(() => {
        if (targetX.value >= startX.value) {
            // При движении вправо, правая часть капли расширяется и двигается к новой позиции
            const left = interpolate(splitProgress.value, [0, 1], [startX.value + DROPLET_WIDTH / 2, targetX.value])
            const width = interpolate(splitProgress.value, [0, 1], [DROPLET_WIDTH / 2, DROPLET_WIDTH])
            return {
                position: 'absolute',
                left,
                width,
                height: DROPLET_HEIGHT,
                backgroundColor: '#757575',
                borderRadius: 3,
                zIndex: 10,
            }
        } else {
            // При движении влево, правая часть остаётся неподвижной и плавно исчезает
            const opacity = interpolate(splitProgress.value, [0, 1], [1, 0])
            return {
                position: 'absolute',
                left: startX.value + DROPLET_WIDTH / 2,
                width: DROPLET_WIDTH / 2,
                height: DROPLET_HEIGHT,
                backgroundColor: '#757575',
                borderRadius: 3,
                opacity,
                zIndex: 10,
            }
        }
    })

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', position: 'relative' }}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        onPress={() => onStepPress?.(index + 1)}
                        // Используем ширину ячейки из анимации, чтобы позиции совпадали
                        style={{ width: CELL_WIDTH_ANIM, alignItems: 'center' }}
                    >
                        <View
                            style={{
                                width: DOT_SIZE,
                                height: DOT_SIZE,
                                borderRadius: DOT_SIZE / 2,
                                backgroundColor: '#75757530',
                                // Смещаем точку, чтобы визуальное расстояние между ними стало меньше
                                transform: [{ translateX: -(CELL_WIDTH_ANIM - CELL_WIDTH_DISPLAY) / 2 }],
                            }}
                        />
                    </TouchableOpacity>
                ))}
                {/* Анимированная капля, состоящая из двух частей */}
                <Animated.View style={leftPartStyle} />
                <Animated.View style={rightPartStyle} />
            </View>
        </View>
    )
}