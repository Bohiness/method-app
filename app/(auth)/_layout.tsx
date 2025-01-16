import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function CoachLayout() {
    const { t } = useTranslation()

    return (
        <Stack>
            <Stack.Screen
                name="signin"
                options={{ headerShown: false }}
            />
        </Stack>
    )
}