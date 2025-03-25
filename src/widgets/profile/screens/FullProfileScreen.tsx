import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useUser } from '@shared/context/user-provider'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { logger } from '@shared/lib/logger/logger.service'
import { getGender } from '@shared/lib/utils/user/getGender'
import { Avatar } from '@shared/ui/avatar'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { InfoGroup, InfoItem } from '@shared/ui/info-item'
import { Text } from '@shared/ui/text'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'

export const FullProfileScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { user, signOut, isAnonymous } = useUser()
    const { t } = useTranslation()


    useEffect(() => {
        logger.log(user, 'useEffect – FullProfileScreen', 'user')
    }, [user])

    const renderLoginButton = () => (
        <Button onPress={() => router.push('/(auth)/signin')}>
            {t('profile.login.button')}
        </Button>
    )

    const renderProfileImage = () => (
        <TouchableOpacity onPress={() => onNavigate('profile_photo')}>
            {user?.profile_photo ? (
                <Avatar
                    source={user.profile_photo}
                    size="2xl"
                    shape="circle"
                />
            ) : (
                <Icon
                    name="User"
                    size={96}
                    className="text-primary"
                />
            )}
        </TouchableOpacity>
    )

    // Если пользователь не авторизован или анонимный
    if (!user || user.is_anonymous_user) {
        return (
            <View className="flex-1 bg-background dark:bg-background-dark">
                <HeaderMenuItem onBack={onBack} title={t('profile.title')} />

                <View className="flex-1 gap-y-6 items-center justify-center px-4">
                    <Icon
                        name="User"
                        size={96}
                        className="text-primary"
                    />

                    <Text size="lg" weight="medium" align='center' className="mt-4 mb-6">
                        {t('profile.unregistered')}
                    </Text>

                    <Button
                        onPress={() => router.push('/(auth)/signin')}
                        className="w-full"
                    >
                        {t('profile.login.button')}
                    </Button>
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            <HeaderMenuItem onBack={onBack} title={t('profile.title')} />

            <View className="flex-1 gap-y-6">
                <View className="items-center">
                    {renderProfileImage()}
                    <Text size="xl" weight="bold" className="mt-2">
                        {`${user.first_name} ${user.last_name}`}
                    </Text>
                </View>

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
                </View>
            </View>
        </View>
    )
}