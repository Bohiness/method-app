import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useUser } from '@shared/context/user-provider'
import { storage } from '@shared/lib/storage/storage.service'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { InfoGroup, InfoItem } from '@shared/ui/info-item'
import { Text } from '@shared/ui/text'
import { useTranslation } from 'react-i18next'
import { Alert, Image, View } from 'react-native'
import { ScreenType } from '../SettingModal'

export const FullProfileScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { user, signOut } = useUser()
    const { t } = useTranslation()

    if (!user) return null

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
                    <Image
                        source={{ uri: user.profile_photo || '/api/placeholder/120/120' }}
                        className="w-24 h-24 rounded-full"
                    />
                    <Text size="xl" weight="bold" className="mt-2">
                        {`${user.first_name} ${user.last_name}`}
                    </Text>
                </View>

                <View className="">
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
                </View>

                <View className="">
                    <HapticTab
                        onPress={handleDeleteAccount}
                        hapticStyle="warning"
                        className="bg-error/10 rounded-lg p-4"
                    >
                        <Text variant="error" className="text-center">
                            {t('profile.deleteAccount.button')}
                        </Text>
                    </HapticTab>
                </View>
            </View>
        </View>
    )
}