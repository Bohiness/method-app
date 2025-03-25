// src/shared/ui/modals/ModalHeader.tsx
import { useTheme } from '@shared/context/theme-provider'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../icon'
interface ModalHeaderProps {
    title?: string
    showCloseButton?: boolean
    onClose?: () => void
    titleLeftComponent?: ReactNode
}
export function ModalHeader({ title, showCloseButton, onClose, titleLeftComponent }: ModalHeaderProps) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <View variant='default' className="relative">
            {titleLeftComponent && (
                <View className="absolute left-4 top-4 z-10">
                    {titleLeftComponent}
                </View>
            )}
            {showCloseButton && (
                <View className="absolute right-4 top-4 z-10">
                    <HapticTab onPress={onClose} className="p-4 items-center justify-center">
                        <Icon name="X" size={26} variant="secondary" />
                    </HapticTab>
                </View>
            )}
            <View className="items-center my-6">
                <View variant='secondary' className="w-14 h-1 rounded-full" style={{ backgroundColor: colors.border }} />
                {title && <Text size="lg" weight="semibold">{t(title)}</Text>}
            </View>
        </View>
    )
}