// app/goals/_layout.tsx
import { Stack } from 'expo-router'

export default function GoalsLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
        }}>
            <Stack.Screen name="index" />
        </Stack>
    )
}