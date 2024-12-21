// src/shared/ui/modal/index.tsx
import React from 'react'
import { View } from 'react-native'
import Modal from 'react-native-modal'

interface CustomModalProps {
    isVisible: boolean
    onClose: () => void
    children: React.ReactNode
}

export const CustomModal: React.FC<CustomModalProps> = ({
    isVisible,
    onClose,
    children
}) => {
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            className="m-0"
            backdropOpacity={0.5}
            animationIn="slideInUp"
            animationOut="slideOutDown"
        >
            <View className="bg-white rounded-t-2xl p-4 mt-auto">
                {children}
            </View>
        </Modal>
    )
}
