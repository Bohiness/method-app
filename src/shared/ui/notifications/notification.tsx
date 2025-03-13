import { useTheme } from '@shared/context/theme-provider'
import { useLocale } from '@shared/hooks/systems/locale/useLocale'
import { Text } from '@shared/ui/text'
import { Image } from 'expo-image'
import { View } from 'react-native'

interface NotificationProps {
    title: string
    description: string
    isVisible?: boolean
    onClose?: () => void
    time?: Date
}

export const NotificationItem = ({
    title = 'Method.do',
    description,
    isVisible = true,
    onClose,
    time = new Date()
}: NotificationProps) => {
    const { isDark } = useTheme()
    const { locale, hour12 } = useLocale()

    const logoSource = isDark
        ? require('assets/images/icons/icon-light.png')
        : require('assets/images/icons/icon-dark.png')


    return (
        <View className="w-full" >
            <View className="w-full bg-background dark:bg-background-dark backdrop-blur-lg rounded-3xl p-4 border border-surface-paper dark:border-surface-paper-dark shadow">
                <View className="flex flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-lg overflow-hidden">
                        <Image
                            source={logoSource}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </View>
                    <View className="flex-1">
                        <View className="flex flex-row items-center justify-between">
                            <Text className="text-base" weight='medium'>
                                {title}
                            </Text>
                            <Text className="text-secondary-light dark:text-secondary-light-dark">
                                {time.toLocaleString(locale, {
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: hour12
                                })}
                            </Text>
                        </View>
                        <Text className="text-base">
                            {description}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

interface NotificationsProps {
    notifications: Array<{
        id: string
        title: string
        description: string
        time: Date
    }>
}

export const NotificationsContainer = ({ notifications }: NotificationsProps) => {
    return (
        <View className="relative w-full">
            {notifications.map((notification, index) => (
                <View
                    key={notification.id}
                    className="absolute w-full"
                    style={{
                        top: index * 16,
                        zIndex: notifications.length - index
                    }}
                >
                    <NotificationItem
                        title={notification.title}
                        description={notification.description}
                        time={notification.time}
                        isVisible={true}
                    />
                </View>
            ))}
        </View>
    )
}