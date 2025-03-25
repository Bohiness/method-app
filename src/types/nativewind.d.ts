declare module 'nativewind' {
    import { StyleProp, ViewStyle } from 'react-native';

    export function useColorScheme(): {
        colorScheme: 'light' | 'dark' | undefined;
        setColorScheme: (colorScheme: 'light' | 'dark') => void;
        toggleColorScheme: () => void;
    };

    export function styled<P>(
        component: React.ComponentType<P>,
        options?: {
            classProps?: string[];
        }
    ): React.ComponentType<P & { className?: string; style?: StyleProp<ViewStyle> }>;
}
