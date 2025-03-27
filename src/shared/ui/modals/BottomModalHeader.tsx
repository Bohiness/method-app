// src/shared/ui/modals/ModalHeader.tsx
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../button'
interface ModalHeaderProps {
    title?: string
    showCloseButton?: boolean
    onClose?: () => void
    titleLeftComponent?: ReactNode
}

export function BottomModalHeader({ title, showCloseButton = true, onClose = () => { router.back() }, titleLeftComponent }: ModalHeaderProps) {
    const { t } = useTranslation()

    return (
        <View variant='transparent' className="relative">
            {titleLeftComponent && (
                <View className="absolute left-4 top-4 z-10">
                    {titleLeftComponent}
                </View>
            )}
            {showCloseButton && (
                <Button variant='ghost' size='sm' onPress={onClose} className="absolute right-0 top-4 z-10" leftIcon={'X'} />
            )}
            <View className="items-center mt-6 mb-4">
                {title && <Text size="lg" weight="semibold">{t(title)}</Text>}
            </View>
        </View>
    )
}