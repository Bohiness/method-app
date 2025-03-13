import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useUser } from '@shared/context/user-provider'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { useLogger } from '@shared/hooks/systems/useLogger'
import { storage } from '@shared/lib/storage/storage.service'
import { getGender } from '@shared/lib/utils/user/getGender'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { InfoGroup, InfoItem } from '@shared/ui/info-item'
import { Text } from '@shared/ui/text'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Alert, Image, TouchableOpacity, View } from 'react-native'

export const FullProfileScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { user, signOut, isAnonymous } = useUser()
    console.log('user isAnonymous', isAnonymous)
    const { t } = useTranslation()
    const logger = useLogger('FullProfileScreen')

    if (!user) {
        return (
            <Button
                onPress={() => {
                    router.push('/(auth)/signin')
                }}
            >
                {t('profile.login.button')}
            </Button>
        )
    }

    const handleDeleteAccount = () => {
        Alert.alert(
            t('profile.deleteAccount.title'),
            t('profile.deleteAccount.message'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel'
                },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await storage.clear()
                            await signOut()
                        } catch (error) {
                            console.error('Error deleting account:', error)
                        }
                    }
                }
            ]
        )
    }

    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            <HeaderMenuItem onBack={onBack} title={t('profile.title')} />

            <View className="flex-1 gap-y-6">
                <View className="items-center">
                    <TouchableOpacity
                        onPress={() => onNavigate('profile_photo')}
                    >
                        {user.profile_photo ? (
                            <Image
                                source={{ uri: user.profile_photo }}
                                className="w-24 h-24 rounded-full"
                            />
                        ) : (
                            <Icon
                                name="User"
                                size={96}
                                className="text-primary"
                            />
                        )}
                    </TouchableOpacity>
                    <Text size="xl" weight="bold" className="mt-2">
                        {!isAnonymous ? `${user.first_name} ${user.last_name}` : t('profile.unregistered')}
                    </Text>
                </View>

                {isAnonymous && (
                    <Button
                        onPress={() => {
                            router.push('/(auth)/signin')
                        }}                    >
                        {t('profile.login.button')}
                    </Button>
                )}

                {!isAnonymous && (
                    <View className="flex-1 gap-y-6">
                        <InfoGroup>
                            <InfoItem
                                label={t('profile.names')}
                                value={`${user.first_name} ${user.last_name}`}
                                empty={!user.first_name || !user.last_name}
                                onPress={() => onNavigate('names')}
                            />
                            <InfoItem
                                label={t('profile.gender')}
                                value={getGender(user.gender)}
                                empty={!user.gender}
                                onPress={() => onNavigate('gender')}
                            />
                        </InfoGroup>

                        <InfoGroup>
                            <InfoItem
                                label={t('profile.email')}
                                value={user.email}
                                verified={user.emailVerification}
                                onPress={() => onNavigate('email')}
                            />
                            <InfoItem
                                label={t('profile.phone')}
                                value={user.phone}
                                verified={user.phoneVerification}
                                onPress={() => onNavigate('phone')}
                            />
                        </InfoGroup>
                        <Button
                            onPress={signOut}
                            variant="default"
                        >
                            {t('profile.logout.button')}
                        </Button>
                        <Button
                            onPress={handleDeleteAccount}
                            variant="destructive"
                        >
                            {t('profile.deleteAccount.button')}
                        </Button>
                    </View>
                )}


            </View>
        </View>
    )
}