import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { MenuItem } from '@shared/ui/modals/menu-item'
import { Title } from '@shared/ui/text'
import SubscriptionCard from '@widgets/subscription/SubscriptionCard'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

interface DefaultScreenProps {
    onNavigate: (screen: ScreenType) => void
}

export const DefaultScreen = ({ onNavigate }: DefaultScreenProps) => {
    const { t } = useTranslation()

    return (
        <View>
            <View className="flex-1">
                <ScrollView
                    className="flex-1"
                >
                    <Title className="mb-4" size="3xl" weight='bold'>
                        {t('profile.title')}
                    </Title>

                    <SubscriptionCard />

                    <View className="gap-y-3 mt-6">
                        <MenuItem
                            label={t('settings.myDiary')}
                            leftIcon={'BookHeart'}
                            isFirst
                            isLast
                            showSeparator
                            onPress={() => {
                                onNavigate('diary')
                            }}
                        />
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
                            label={t('settings.subscription.title')}
                            leftIcon={'Orbit'}
                            isFirst
                            isLast
                            showSeparator
                            onPress={() => {
                                onNavigate('subscription')
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