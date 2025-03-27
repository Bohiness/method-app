import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { AnimatedCheck } from '@shared/ui/animated-icon/check'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { StreakWidget } from '@widgets/gamification/streak/StreakWidget'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'

export default function SuccessScreen() {
    const { t } = useTranslation()

    return (
        <ModalBottomScreenContent>
            <View className="flex-1 px-4">
                <View className="flex-1 items-center justify-center">

                    <AnimatedCheck
                        size={100}
                    />

                    <Animated.View entering={FadeIn.delay(600)} className='pt-10'>
                        <Title className="text-center mb-4">
                            {t('diary.journal.success.title')}
                        </Title>
                        <Text
                            variant="secondary"
                            className="text-center mb-8"
                        >
                            {t('diary.journal.success.description')}
                        </Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeIn.delay(900)}
                        className="w-full mb-8"
                    >
                        <StreakWidget />
                    </Animated.View>
                </View>
            </View>
        </ModalBottomScreenContent>
    )
}   