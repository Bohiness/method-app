// src/shared/ui/modals/ModalHeader.tsx
import { View } from '@shared/ui/view'

export function ModalHeader() {

    return (
        <View variant='default' >
            {/* Линия, сигнализирующая о возможности закрытия окна */}
            <View className="items-center my-6">
                <View className="w-14 h-1 rounded-full bg-border dark:bg-border-dark" />
            </View>

        </View>
    )
}