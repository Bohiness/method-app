import { Dimensions } from 'react-native';
import { GestureEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UseCarouselAnimationProps {
    onChangePage?: (direction: 'left' | 'right') => void;
    canSwipeLeft?: boolean;
    canSwipeRight?: boolean;
    snapThreshold?: number;
    velocityThreshold?: number;
    selectedTimestamp?: number;
    animationConfig?: {
        duration?: number;
    };
    scaling?: {
        active: number;
        inactive: number;
    };
    opacity?: {
        active: number;
        inactive: number;
    };
    onSwipeStart?: () => void;
}

export const useCarouselAnimation = ({
    onChangePage,
    canSwipeLeft = true,
    canSwipeRight = true,
    snapThreshold = SCREEN_WIDTH * 0.3,
    velocityThreshold = 500,
    selectedTimestamp,
    animationConfig = {
        duration: 300,
    },
    scaling = {
        active: 1,
        inactive: 0.8,
    },
    opacity = {
        active: 1,
        inactive: 0.5,
    },
    onSwipeStart,
}: UseCarouselAnimationProps = {}) => {
    const translateX = useSharedValue(0);
    const lastTimestamp = useSharedValue(selectedTimestamp);
    const isGestureActive = useSharedValue(false);
    const isSwipeAnimation = useSharedValue(false);

    // Флаг, блокирующий реакцию на изменение timestamp после свайпа
    const skipNextTimestampReaction = useSharedValue(false);
    // Добавим переменную для отслеживания последней анимации
    const lastAnimationTime = useSharedValue(0);

    const animate = (toValue: number, callback?: () => void) => {
        'worklet';
        console.log(`Starting animation to ${toValue}`);
        // Запоминаем время начала анимации
        lastAnimationTime.value = Date.now();

        translateX.value = withTiming(toValue, { duration: animationConfig.duration }, () => {
            console.log('Animation completed');
            if (callback) {
                callback();
            }
            isSwipeAnimation.value = false;
        });
    };

    // --- useAnimatedReaction, который слушает изменение selectedTimestamp ---
    useAnimatedReaction(
        () => selectedTimestamp,
        (current, previous) => {
            // Убедимся, что previous и current определены
            if (previous === null || current === null || previous === undefined || current === undefined) {
                return;
            }

            console.log('useAnimatedReaction:', { current, previous, skip: skipNextTimestampReaction.value });

            // Проверка флага блокировки
            if (skipNextTimestampReaction.value) {
                console.log('Skipping reaction due to skipNextTimestampReaction flag');
                skipNextTimestampReaction.value = false;
                return;
            }

            // Добавляем проверку времени с последней анимации с большим запасом
            const timeSinceLastAnimation = Date.now() - lastAnimationTime.value;
            if (timeSinceLastAnimation < (animationConfig.duration || 300) * 2) {
                console.log('Ignoring reaction due to recent animation:', timeSinceLastAnimation);
                return;
            }

            // Проверка активного жеста
            if (isGestureActive.value || isSwipeAnimation.value) {
                console.log('Ignoring reaction due to active gesture or animation');
                return;
            }

            // Теперь можно безопасно проверить, нужно ли анимировать изменение даты
            if (current !== previous && current !== lastTimestamp.value) {
                console.log('Animating date change:', { from: previous, to: current });
                const direction = current < previous ? -SCREEN_WIDTH : SCREEN_WIDTH;
                translateX.value = direction;
                animate(0, () => {
                    lastTimestamp.value = current;
                });
            }
        }
    );

    // --- useAnimatedGestureHandler ---
    // Обработчик жестов для анимированного свайпа карточек
    const gestureHandler = useAnimatedGestureHandler<
        GestureEvent<PanGestureHandlerEventPayload>,
        { startX: number; isAnimating: boolean }
    >({
        // Вызывается при начале жеста
        onStart: (_, context) => {
            isGestureActive.value = true; // Помечаем что жест активен
            context.startX = translateX.value; // Сохраняем текущую позицию
            context.isAnimating = false; // Сбрасываем флаг анимации

            if (onSwipeStart) {
                runOnJS(onSwipeStart)();
            }
        },

        // Вызывается при движении пальца
        onActive: (event, context) => {
            if (context.isAnimating) return; // Если идет анимация - игнорируем

            const newTranslateX = context.startX + event.translationX;

            // Если свайп запрещен в данном направлении -
            // делаем движение "резиновым" (умножаем на 0.2)
            if ((!canSwipeRight && newTranslateX > 0) || (!canSwipeLeft && newTranslateX < 0)) {
                translateX.value = newTranslateX * 0.2;
            } else {
                translateX.value = newTranslateX;
            }
        },

        // Вызывается при завершении жеста
        onEnd: event => {
            const isSwipeRight = translateX.value > 0;
            const isSwipeLeft = translateX.value < 0;

            if (Math.abs(event.velocityX) > velocityThreshold || Math.abs(translateX.value) > snapThreshold) {
                if ((isSwipeRight && !canSwipeRight) || (isSwipeLeft && !canSwipeLeft)) {
                    animate(0);
                    isGestureActive.value = false;
                    return;
                }

                const direction = isSwipeRight ? 'right' : 'left';
                isSwipeAnimation.value = true;

                // Устанавливаем флаг ДО начала анимации
                skipNextTimestampReaction.value = true;

                // Анимируем уход текущей карточки
                animate(direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, () => {
                    // Сразу сбрасываем позицию на ноль без анимации
                    translateX.value = 0;

                    // Безопасно вызываем колбэк в потоке JavaScript
                    if (onChangePage) {
                        runOnJS(onChangePage)(direction);
                    }

                    // Обновляем время последней анимации и сбрасываем флаги
                    lastAnimationTime.value = Date.now();
                    isGestureActive.value = false;
                    isSwipeAnimation.value = false;
                });
            } else {
                animate(0);
                isGestureActive.value = false;
            }
        },
    });

    // --- стили анимации ---
    const currentStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            {
                scale: interpolate(
                    Math.abs(translateX.value),
                    [0, SCREEN_WIDTH],
                    [scaling.active, scaling.inactive],
                    Extrapolate.CLAMP
                ),
            },
        ],
        opacity: interpolate(
            Math.abs(translateX.value),
            [0, SCREEN_WIDTH],
            [opacity.active, opacity.inactive],
            Extrapolate.CLAMP
        ),
    }));

    const prevStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(
                    translateX.value,
                    [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                    [-2 * SCREEN_WIDTH, -SCREEN_WIDTH, 0],
                    Extrapolate.CLAMP
                ),
            },
            {
                scale: interpolate(
                    translateX.value,
                    [0, SCREEN_WIDTH],
                    [scaling.inactive, scaling.active],
                    Extrapolate.CLAMP
                ),
            },
        ],
        opacity: interpolate(
            translateX.value,
            [0, SCREEN_WIDTH],
            [canSwipeRight ? opacity.inactive : 0, opacity.active],
            Extrapolate.CLAMP
        ),
    }));

    const nextStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(
                    translateX.value,
                    [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                    [0, SCREEN_WIDTH, 2 * SCREEN_WIDTH],
                    Extrapolate.CLAMP
                ),
            },
            {
                scale: interpolate(
                    translateX.value,
                    [-SCREEN_WIDTH, 0],
                    [scaling.active, scaling.inactive],
                    Extrapolate.CLAMP
                ),
            },
        ],
        opacity: interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0],
            [opacity.active, canSwipeLeft ? opacity.inactive : 0],
            Extrapolate.CLAMP
        ),
    }));

    return {
        translateX,
        gestureHandler,
        currentStyle,
        prevStyle,
        nextStyle,
    };
};
