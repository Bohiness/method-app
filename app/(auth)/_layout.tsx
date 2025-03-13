import { ModalHeader } from '@shared/ui/modals/ModalHeader'
import { CustomHeader } from '@widgets/navigation/CustomHeader'
import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'


export default function AuthLayout() {
    const { t } = useTranslation()

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="signin"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    header: () => (<ModalHeader />),
                }}
            />
            <Stack.Screen
                name="email"
                options={{
                    header: () => (
                        <CustomHeader
                            showBackButton
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="forgot"
                options={{
                    header: () => (
                        <CustomHeader
                            showBackButton
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="reset-password"
                options={{
                    header: () => (
                        <CustomHeader
                            showBackButton
                        />
                    ),
                }}
            />
        </Stack>
    )
}