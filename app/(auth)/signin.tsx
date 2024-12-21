// src/app/profile.tsx
import { useLanguage } from '@context/language-provider'
import { useUser } from '@context/user-provider'
import { Stack } from 'expo-router'
import { View } from 'react-native'

export default function ProfileScreen() {
    const { user, signOut } = useUser()
    const { currentLanguage, changeLanguage } = useLanguage()

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Signin',
                    headerStyle: { backgroundColor: 'black' },
                    headerTintColor: 'white',
                }}
            />
            <View className="flex-1 bg-black p-4">

            </View>
        </>
    )
}