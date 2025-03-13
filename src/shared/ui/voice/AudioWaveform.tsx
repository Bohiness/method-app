import { useColorScheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { View } from 'react-native'
import Animated from 'react-native-reanimated'

interface AudioWaveformProps {
    level: number
}

export const AudioWaveform = ({ level }: AudioWaveformProps) => {
    const bars = Array.from({ length: 10 })
    const colorScheme = useColorScheme()

    return (
        <View className="flex-row items-center h-8 gap-0.5">
            {bars.map((_, i) => {
                const height = Math.max(4, Math.min(32, level * (i + 1) * 3))
                return (
                    <Animated.View
                        key={i}
                        className={cn(
                            'w-1 rounded-full',
                            colorScheme === 'dark' ? 'bg-white/80' : 'bg-black/80'
                        )}
                        style={{ height }}
                    />
                )
            })}
        </View>
    )
}