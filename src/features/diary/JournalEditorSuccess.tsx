import SuccessScreen from '@features/screens/SuccessScreen'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'

interface JournalEditorSuccessProps {
    wordCount?: number
    timeSpentSeconds?: number
}

export default function JournalEditorSuccess({
    wordCount,
    timeSpentSeconds,
}: JournalEditorSuccessProps) {
    const { t } = useTranslation()
    const minutes = timeSpentSeconds ? Math.floor(timeSpentSeconds / 60) : 0
    const seconds = timeSpentSeconds ? timeSpentSeconds % 60 : 0

    const additionalContent = (
        <Animated.View
            entering={FadeIn.delay(1200)}
            className="flex-row justify-center gap-4 w-full flex-wrap"
        >
            {wordCount && wordCount > 0 && (
                <View variant="paper" className=" p-3 rounded-lg flex-row items-center gap-2 mb-2">
                    <Icon
                        name="FileText"
                        size={18}
                        variant="secondary"
                        className="opacity-80"
                    />
                    <Text weight="semibold">{wordCount}</Text>
                    <Text variant="secondary">
                        {t('diary.journal.success.words')}
                    </Text>
                </View>
            )}

            {timeSpentSeconds && timeSpentSeconds > 0 && (
                <View variant="paper" className=" p-3 rounded-lg flex-row items-center gap-2 flex-wrap mb-2">
                    <Icon
                        name="Clock"
                        size={18}
                        variant="secondary"
                        className="opacity-80"
                    />
                    <Text>
                        {minutes > 0 && (
                            <View className="flex-row items-center gap-1">
                                <Text weight="semibold">{minutes}</Text>
                                <Text variant="secondary" className="mr-1">
                                    {t('diary.journal.success.minutes')}
                                </Text>
                            </View>
                        )}
                        {seconds > 0 && (
                            <View className="flex-row items-center gap-1">
                                <Text weight="semibold">{seconds}</Text>
                                <Text variant="secondary">
                                    {t('diary.journal.success.seconds')}
                                </Text>
                            </View>
                        )}
                    </Text>
                </View>
            )}
        </Animated.View>
    )

    return (
        <SuccessScreen
            title={t('diary.journal.success.title')}
            description={t('diary.journal.success.description')}
            onButtonPress={() => router.dismissAll()}
            additionalContent={additionalContent}
            showStreakWidget={false}
        />
    )
}   