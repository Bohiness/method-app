import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'


export default function ForgotLayout() {
    const { t } = useTranslation()

    return (

        <Stack>
            <Stack.Screen
                name="forgot-password"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="verify-code"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="reset-password"
                options={{
                    headerShown: false
                }}
            />
        </Stack>
    )
}