import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { cn } from '@shared/lib/utils/cn'
import { BottomModalHeader } from '@shared/ui/modals/BottomModalHeader'
import { Text } from '@shared/ui/text'
import { View, ViewProps } from '@shared/ui/view'
import { useLayoutEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurredScreenBackground } from './blurred-screen-background'

interface ModalBottomScreenViewProps extends ViewProps {
    showHeader?: boolean
    title?: string
    fullScreen?: boolean
    headerOnClose?: () => void
    headerCloseButton?: boolean
    description?: string
}

export const ModalBottomScreenContent = ({
    className,
    variant = 'transparent',
    showHeader = true,
    title,
    fullScreen = false,
    headerOnClose,
    description,
    headerCloseButton,
    ...props }: ModalBottomScreenViewProps) => {

    const insets = useSafeAreaInsets()
    const { isKeyboardVisible, keyboardHeight } = useKeyboard()
    const [height, setHeight] = useState<number>(0)
    const [marginBottom, setMarginBottom] = useState<number>(0)

    useLayoutEffect(() => {

        if (height > 803) {
            setMarginBottom(80)
            return
        }

        if (height < 803) {
            setMarginBottom(0)
            return
        }

    }, [height])

    return (
        <BlurredScreenBackground
            overlayOpacity={0.8}
        >
            <View
                className={cn('relative flex-1 px-4', className)}
                variant={variant}
                style={{ paddingBottom: isKeyboardVisible ? keyboardHeight : insets.bottom + marginBottom }}
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout
                    setHeight(height)
                }}
                {...props}
            >
                {showHeader && <BottomModalHeader title={title} onClose={headerOnClose} showCloseButton={headerCloseButton} />}
                {description && <Text variant="secondary" size="sm" align="center" className="mb-4 px-4 -mt-3">{description}</Text>}
                {props.children}
                {(__DEV__) && (
                    <View variant="stone" className="absolute top-0 right-0 px-2 py-1 rounded-bl-md opacity-70">
                        <Text className="text-xs text-muted-foreground">{Math.round(height)}px</Text>
                    </View>
                )}
            </View>
        </BlurredScreenBackground>
    )
}