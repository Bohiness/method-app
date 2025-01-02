import { useState } from "react"

// Модифицируем хук для поддержки вложенности:
export const useScreenNavigation = <T extends string>(initialScreen: T) => {
 type ScreenType = {screen: T, level: number}
 const [stack, setStack] = useState<ScreenType[]>([
   {screen: initialScreen, level: 0}
 ]);

 const navigate = (screen: T, level: number = 0) => {
   setStack(prev => [...prev, {screen, level}]);
 };

 const goBack = () => {
   setStack(prev => prev.slice(0, -1));
 };

 const current = stack[stack.length - 1];
 const previous = stack[stack.length - 2];

 return {
   currentScreen: current.screen,
   currentLevel: current.level,
   previousScreen: previous?.screen,
   isGoingBack: false,
   navigate,
   goBack,
   canGoBack: stack.length > 1
 };
};