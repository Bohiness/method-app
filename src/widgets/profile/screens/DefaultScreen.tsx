import { useUser } from '@shared/context/user-provider'
import { MenuItem } from '@shared/ui/modals/menu-item'
import { Title } from '@shared/ui/styled-text'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { ScreenType } from '../SettingModal'

interface DefaultScreenProps {
    onNavigate: (screen: ScreenType) => void
}

export const DefaultScreen = ({ onNavigate }: DefaultScreenProps) => {
    const { t } = useTranslation()
    const { user } = useUser()

    return (
        <View>
            <View className="flex-1">
                <ScrollView
                    className="flex-1"
                >
                    <Title className="mb-4" size="3xl" weight='bold'>
                        {t('profile.title')}
                    </Title>

                    {/* <SubscriptionCard /> */}


                    <View className="gap-y-3 mt-10">
                        <MenuItem
                            label={t('settings.viewProfile')}
                            leftIcon={'User'}
                            isFirst
                            isLast
                            showSeparator
                            onPress={() => {
                                onNavigate('profile')
                            }}
                        />

                        <MenuItem
                            label={t('settings.settings')}
                            leftIcon={'Settings'}
                            isFirst
                            isLast
                            showSeparator
                            onPress={() => {
                                onNavigate('settings')
                            }}
                        />

                    </View>
                </ScrollView>
            </View>



        </View>
    )
}