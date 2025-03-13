import { CheckConnect } from '@features/system/CheckConnect'
import { Text } from '@shared/ui/text'
import { Container, View } from '@shared/ui/view'
import { CoachesWidgets } from '@widgets/coaches/coach-widgets/CoachesWidgets'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'



export default function ExploreScreen() {
    const { t } = useTranslation()

    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="flex-1 gap-y-6">
                    <View>
                        <Text className='text-center' variant="secondary">
                            {t('explore.description')}
                        </Text>
                    </View>
                    <CheckConnect>
                        <CoachesWidgets limit={3} />
                    </CheckConnect>
                </View>
            </ScrollView>
        </Container>
    )
}