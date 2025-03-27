import { BottomModalHeader } from '@shared/ui/modals/BottomModalHeader'
import { CustomHeader } from '@widgets/navigation/CustomHeader'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'


export default function AuthLayout() {
    const { t } = useTranslation()

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="signin"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    contentStyle: {
                        backgroundColor: 'transparent',
                    },
                    header: () => (<BottomModalHeader />),
                }}
            />
            <Stack.Screen
                name="email"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    contentStyle: {
                        backgroundColor: 'transparent',
                    },
                    header: () => (<BottomModalHeader />),
                }}
            />
            <Stack.Screen
                name="forgot"

                options={{
                    contentStyle: {
                        backgroundColor: 'transparent',
                    },
                    header: () => (
                        <CustomHeader
                            showBackButton
                        />
                    ),
                }}
            />
        </Stack>
    )
}

