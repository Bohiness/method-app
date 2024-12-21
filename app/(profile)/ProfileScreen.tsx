// src/app/profile.tsx
import { useLanguage } from '@context/language-provider'
import { useUser } from '@context/user-provider'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'

export default function ProfileScreen() {
    const { user, signOut } = useUser()
    const { currentLanguage, changeLanguage } = useLanguage()
    const { t } = useTranslation()

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Профиль',
                    headerStyle: { backgroundColor: 'black' },
                    headerTintColor: 'white',
                }}
            />
            <View className="flex-1 bg-black p-4">
                <View className="bg-zinc-900 rounded-lg p-4 mb-4">
                    <Text className="text-white text-xl font-bold mb-2">{user?.first_name}</Text>
                    <Text className="text-zinc-400">{user?.email}</Text>
                </View>

                <View className="bg-zinc-900 rounded-lg p-4 mb-4">
                    <Text className="text-white text-lg mb-4">{t('settings')}</Text>

                    {/* Переключатель языка */}
                    <Pressable
                        className="flex-row justify-between items-center mb-4"
                        onPress={() => changeLanguage(currentLanguage === 'ru' ? 'en' : 'ru')}
                    >
                        <Text className="text-white">{t('language')}</Text>
                        <Text className="text-zinc-400">
                            {currentLanguage === 'ru' ? 'Русский' : 'English'}
                        </Text>
                    </Pressable>

                    {/* Дополнительные настройки можно добавить здесь */}
                </View>

                <Pressable
                    onPress={signOut}
                    className="bg-red-500 p-4 rounded-lg mt-auto"
                >
                    <Text className="text-white text-center font-bold">{t('sign_out')}</Text>
                </Pressable>
            </View>
        </>
    )
}