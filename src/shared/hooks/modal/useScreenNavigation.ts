// src/shared/hooks/modal/useScreenNavigation.ts
import { SCREEN_CONFIG } from '@widgets/profile/screens/configs/screens.config';
import { useCallback, useState } from 'react';

// Тип экрана
export type ScreenType = keyof typeof SCREEN_CONFIG;

// Хук для управления навигацией внутри модального окна
export const useScreenNavigation = <T extends ScreenType>(initialScreen: T) => {
    type ScreenTypeWithLevel = { screen: T; level: number };
    const [isGoingBack, setIsGoingBack] = useState(false);
    const [stack, setStack] = useState<ScreenTypeWithLevel[]>([
        { screen: initialScreen, level: SCREEN_CONFIG[initialScreen].level },
    ]);
    const [history, setHistory] = useState<ScreenTypeWithLevel[]>([]); // История навигации

    const navigate = useCallback(
        (screen: T) => {
            const targetLevel = SCREEN_CONFIG[screen].level;
            const currentLevel = stack[stack.length - 1].level;
            const currentScreen = stack[stack.length - 1].screen;

            if (targetLevel < currentLevel) {
                // Переход назад
                setIsGoingBack(true);
                // Добавляем текущий экран в историю
                setHistory(prev => [...prev, { screen: currentScreen, level: currentLevel }]);
                // Очищаем стек до целевого уровня и добавляем целевой экран
                setStack(prev => [...prev.filter(item => item.level <= targetLevel), { screen, level: targetLevel }]);
            } else if (targetLevel === currentLevel) {
                // Заменяем текущий экран на новый экран того же уровня
                setIsGoingBack(false);
                // Добавляем текущий экран в историю
                setHistory(prev => [...prev, { screen: currentScreen, level: currentLevel }]);
                setStack(prev => [...prev.slice(0, -1), { screen, level: targetLevel }]);
            } else {
                // Переход вперёд
                setIsGoingBack(false);
                // Добавляем текущий экран в историю
                setHistory(prev => [...prev, { screen: currentScreen, level: currentLevel }]);
                // Добавляем новый экран в стек
                setStack(prev => [...prev, { screen, level: targetLevel }]);
            }
        },
        [stack]
    );

    const goBack = useCallback(() => {
        if (stack.length <= 1 && history.length === 0) return;

        setIsGoingBack(true);
        const currentLevel = stack[stack.length - 1].level;

        // Находим ближайший нижний уровень
        const targetLevel = Math.max(
            ...stack
                .slice(0, -1)
                .map(item => item.level)
                .filter(level => level < currentLevel)
        );

        // Возвращаемся к ближайшему экрану нижнего уровня
        const targetScreen = stack.find(item => item.level === targetLevel)?.screen;

        if (targetScreen) {
            setStack(prev => [
                ...prev.filter(item => item.level <= targetLevel),
                { screen: targetScreen, level: targetLevel },
            ]);
        }

        // Обновляем историю
        setHistory(prev => prev.slice(0, -1));
    }, [stack, history]);

    const current = stack[stack.length - 1];
    const previous =
        stack.length > 1 ? stack[stack.length - 2] : history.length > 0 ? history[history.length - 1] : undefined;

    return {
        currentScreen: current.screen,
        currentLevel: current.level,
        previousScreen: previous?.screen,
        isGoingBack,
        navigate,
        goBack,
        canGoBack: stack.length > 1 || history.length > 0,
        stack,
    };
};
