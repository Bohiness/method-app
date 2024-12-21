// src/shared/ui/bottom-sheet/index.tsx
import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet'
import React, { useMemo } from 'react'
import { View } from 'react-native'

interface BottomSheetProps extends Partial<BottomSheetModalProps> {
    children: React.ReactNode
}

export const CustomBottomSheet = React.forwardRef<BottomSheetModal, BottomSheetProps>(
    ({ children, snapPoints: userSnapPoints, ...props }, ref) => {
        const snapPoints = useMemo(() => userSnapPoints || ['25%', '50%', '90%'], [userSnapPoints])

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                backgroundStyle={{
                    backgroundColor: 'white',
                }}
                handleIndicatorStyle={{
                    backgroundColor: '#000',
                    width: 40,
                }}
                {...props}
            >
                <View className="flex-1 p-4">
                    {children}
                </View>
            </BottomSheetModal>
        )
    }
)
