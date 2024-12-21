// useCarouselAnimation.ts

import { Dimensions } from 'react-native'
import { GestureEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler'
import {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated'

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
}: UseCarouselAnimationProps = {}) => {
    const translateX = useSharedValue(0);
    const lastTimestamp = useSharedValue(selectedTimestamp);
    const isGestureActive = useSharedValue(false);
    const isSwipeAnimation = useSharedValue(false);

    // ФЛАГ, КОТОРЫЙ «ПРОПУСКАЕТ» СЛЕДУЮЩИЙ UPDATE, 
    // когда дата поменялась из свайпа:
    const skipNextTimestampReaction = useSharedValue(false);

    const animate = (toValue: number, callback?: () => void) => {
        'worklet';
        translateX.value = withTiming(
            toValue,
            { duration: animationConfig.duration },
            () => {
                if (callback) {
                    callback();
                }
                isSwipeAnimation.value = false;
            }
        );
    };

    // --- useAnimatedReaction, который слушает изменение selectedTimestamp ---
    useAnimatedReaction(
        () => selectedTimestamp,
        (current, previous) => {
            // 1. Если флаг skipNextTimestampReaction = true,
            //    значит сейчас изменение пришло из свайпа. Пропускаем.
            if (skipNextTimestampReaction.value) {
                skipNextTimestampReaction.value = false; // сбрасываем
                return;
            }

            // 2. Обычная логика: если timestamp реально изменился,
            //    и не активен жест, и не идёт свайповая анимация
            if (
                previous &&
                current !== undefined &&
                current !== previous &&
                !isGestureActive.value &&
                !isSwipeAnimation.value
            ) {
                const direction = current < previous ? -SCREEN_WIDTH : SCREEN_WIDTH;
                
                // Перед анимацией сдвинем translateX
                translateX.value = direction;
                
                // Анимируем к 0
                animate(0, () => {
                    lastTimestamp.value = current;
                });
            }
        },
        [selectedTimestamp]
    );

    // --- useAnimatedGestureHandler ---
    const gestureHandler = useAnimatedGestureHandler<
        GestureEvent<PanGestureHandlerEventPayload>,
        { startX: number; isAnimating: boolean }
    >({
        onStart: (_, context) => {
            isGestureActive.value = true;
            context.startX = translateX.value;
            context.isAnimating = false;
        },
        onActive: (event, context) => {
            if (context.isAnimating) return;

            const newTranslateX = context.startX + event.translationX;

            if ((!canSwipeRight && newTranslateX > 0) || (!canSwipeLeft && newTranslateX < 0)) {
                translateX.value = newTranslateX * 0.2;
            } else {
                translateX.value = newTranslateX;
            }
        },
        onEnd: (event) => {
            const isSwipeRight = translateX.value > 0;
            const isSwipeLeft = translateX.value < 0;

            if (
                Math.abs(event.velocityX) > velocityThreshold ||
                Math.abs(translateX.value) > snapThreshold
            ) {
                // Проверяем, что действительно можем свайпнуть.
                // Например, не даём уйти вправо, если canSwipeRight = false, и т. д.
                if (
                    (isSwipeRight && !canSwipeRight) ||
                    (isSwipeLeft && !canSwipeLeft)
                ) {
                    // Просто отменяем: возвращаем всё на место
                    animate(0);
                    isGestureActive.value = false;
                    return;
                }

                // На этом этапе ясно, что пользователь Свайпнул:
                const direction = isSwipeRight ? 'right' : 'left';
                isSwipeAnimation.value = true;

                // -- ВАЖНО: скажем реактору "пропустить" следующее изменение TS, 
                //    потому что оно произойдёт именно из свайпа:
                skipNextTimestampReaction.value = true;

                // Запускаем анимацию "ухода" карточки
                animate(
                    direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
                    () => {
                        // Завершив анимацию, вызовем onChangePage
                        if (onChangePage) {
                            runOnJS(onChangePage)(direction);
                        }
                        // Возвращаем translateX на 0
                        translateX.value = 0;
                        isGestureActive.value = false;
                    }
                );
            } else {
                // Если "снэп" не достигнут — возвращаем карточку на место
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
