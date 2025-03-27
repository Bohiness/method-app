import { View } from '@shared/ui/view'

import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { cn } from '@shared/lib/utils/cn'
import { FullScreenModalHeader } from '@shared/ui/modals/FullScreenModalHeader'
import { ViewProps } from '@shared/ui/view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ModalFullScreenContentViewProps extends ViewProps {
    showHeader?: boolean
    title?: string
    showCloseButton?: boolean
    headerVariant?: 'default' | 'transparent'
    headerCenterContent?: React.ReactNode
    headerOnClose?: () => void
    headerCloseButton?: boolean
    headerLeftContent?: React.ReactNode
}

export const ModalFullScreenContent = ({
    className,
    variant = 'default',
    showHeader = true,
    title,
    showCloseButton = true,
    headerVariant = 'default',
    headerCenterContent,
    headerOnClose,
    headerCloseButton = true,
    headerLeftContent,
    ...props
}: ModalFullScreenContentViewProps) => {

    const insets = useSafeAreaInsets()
    const { isKeyboardVisible, keyboardHeight } = useKeyboard()

    return (
        <View
            className={cn('relative flex-1', className)}
            variant={variant}
            style={{ paddingBottom: isKeyboardVisible ? keyboardHeight : insets.bottom }}
            {...props}
        >
            {showHeader && <FullScreenModalHeader variant={headerVariant} centerContent={headerCenterContent} onClose={headerOnClose} closeButton={headerCloseButton} leftContent={headerLeftContent} />}
            {props.children}
        </View>
    )
}