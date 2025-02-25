// src/shared/ui/layout/Header.tsx
import { Colors } from '@shared/constants/colors'
import { useUser } from '@shared/context/user-provider'
import { useColorScheme } from '@shared/hooks/systems/colors/useColorScheme'
import { Icon } from '@shared/ui/icon'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface HeaderProps {
    leftContent?: React.ReactNode
    showLeftContent?: boolean
}

export const Header: React.FC<HeaderProps> = ({
    leftContent,
    showLeftContent = true
}) => {
    const router = useRouter()
    const { user } = useUser()
    const insets = useSafeAreaInsets()
    const colorScheme = useColorScheme() ?? 'light'
    const theme = Colors[colorScheme as keyof typeof Colors]

    const handleUserPress = () => {
        router.push('/ProfileScreen')
    }

    return (
        <View
            className={`${theme.background}`}
            style={{
                paddingTop: insets.top,
            }}
        >
            <View className="flex-row justify-between items-center px-4 py-2">
                {/* Левая часть (счетчик дней или другой контент) */}
                <View className="flex-1">
                    {showLeftContent && (leftContent || (
                        <View className="flex-row items-center">
                            <Text className={`${theme.accent} text-lg font-bold`}>0</Text>
                            <Text className={`${theme.secondaryText} text-sm ml-2`}>
                                дней в ударе
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Правая часть (кнопка профиля) */}
                <Pressable
                    onPress={handleUserPress}
                    className={`w-10 h-10 rounded-full ${theme.profileButton} items-center justify-center`}
                >
                    {user?.profile_photo ? (
                        <Image
                            source={{ uri: user.profile_photo }}
                            className="w-full h-full rounded-full"
                        />
                    ) : (
                        <Icon
                            name="User"
                            size={20}
                            color={theme.text}
                        />
                    )}
                </Pressable>
            </View>
        </View>
    )
}