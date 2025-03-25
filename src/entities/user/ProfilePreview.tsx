import { useUser } from '@shared/context/user-provider'
import { Avatar } from '@shared/ui/avatar'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { TouchableOpacity } from 'react-native'

interface ProfilePreviewProps {
    onPress: () => void
}

export function ProfilePreview({
    onPress,
}: ProfilePreviewProps) {
    const { user } = useUser()

    console.log(user)

    return (
        <TouchableOpacity onPress={onPress} className="p-4">
            <View className="flex-row gap-x-4">
                <Avatar
                    size="xl"
                    shape="square"
                    source={user?.profile_photo}
                    fallback={user?.first_name[0]}
                    className="rounded-2xl"
                />

                <View className="flex-1 justify-center">
                    <Title
                        weight="medium"
                        className="mr-2"
                    >
                        {user?.first_name} {user?.last_name}
                    </Title>

                    <View className="flex-row items-center mb-1">
                        <Text
                            variant="secondary"
                        >
                            {user?.email}
                        </Text>
                        {user?.emailVerification && (
                            <Icon
                                name="ShieldCheck"
                                size={16}
                            />
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}