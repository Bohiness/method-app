import { useStreakStats } from '@shared/hooks/gamification/useGamification'
import { Icon } from '@shared/ui/icon'
import { Title } from '@shared/ui/text'
import { Pressable } from 'react-native'

export function StreakHeaderButton() {
    const { current_streak } = useStreakStats()

    return (
        <Pressable
            className="flex-row rounded-full items-center justify-center px-2"
        >
            <Icon
                name="Flame"
                size={24}
                variant="secondary"
            />
            <Title
                variant="secondary"
                size="xl"
                weight="medium"
                className="ml-1"
            >
                {current_streak || 0}
            </Title>
        </Pressable>
    )
}