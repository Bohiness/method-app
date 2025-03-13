import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Separator } from '@shared/ui/separator'
import { Text } from '@shared/ui/text'
import { ChevronRight } from 'lucide-react-native'
import { ReactNode } from 'react'
import { View } from 'react-native'

interface InfoItemProps {
    label: string
    value: string
    verified?: boolean
    empty?: boolean
    onPress?: () => void
    rightIcon?: ReactNode
    haptic?: boolean
}

export const InfoItem = ({
    label,
    value,
    verified,
    empty,
    onPress,
    rightIcon = <ChevronRight size={20} className="text-inactive dark:text-inactive-dark" />,
    haptic = true
}: InfoItemProps) => {
    const ContentWrapper = onPress ? HapticTab : View
    const wrapperProps = onPress ? {
        onPress,
        hapticStyle: 'light' as const,
        className: "flex-1"
    } : { className: "flex-1" }

    return (
        <View className="flex-row items-center">
            <ContentWrapper {...wrapperProps}>
                <Text variant="secondary" size="sm">{label}</Text>
                <View className="flex-row items-center mt-1">
                    {value && <Text className='mr-2'>{value}</Text>}
                    {empty && <Text className='mr-2'>-</Text>}
                    {verified !== undefined && (
                        <View className={`px-2 py-1 rounded ${verified ? 'bg-success/10' : 'bg-warning/10'}`}>
                            <Text
                                size="xs"
                                variant={verified ? 'success' : 'warning'}
                            >
                                {verified ? 'Verified' : 'Not verified'}
                            </Text>
                        </View>
                    )}
                </View>
            </ContentWrapper>
            {onPress && rightIcon}
        </View>
    )
}

interface InfoGroupProps {
    children: ReactNode
    className?: string
}

export const InfoGroup = ({ children, className = "" }: InfoGroupProps) => (
    <View className={`bg-surface-paper dark:bg-surface-paper-dark rounded-lg p-4 ${className}`}>
        {Array.isArray(children) ? (
            children.map((child, index) => (
                <View key={index}>
                    {child}
                    {index < children.length - 1 && <Separator className="my-3" />}
                </View>
            ))
        ) : (
            children
        )}
    </View>
)
