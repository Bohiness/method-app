// src/features/coaches/coach-screen/CoachStats.tsx
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'

interface StatItemProps {
    value: string | number
    label: string
}

const StatItem = ({ value, label }: StatItemProps) => (
    <View className="items-center">
        <Text size="xl" weight="bold">{value}</Text>
        <Text variant="secondary" size="sm">{label}</Text>
    </View>
)

interface CoachStatsProps {
    rating: number
    pricePerLesson: number
    reviewsCount: number
    lessonsCount: number
    yearsOfExperience: number
}

export const CoachStats = ({
    rating,
    pricePerLesson,
    reviewsCount,
    lessonsCount,
    yearsOfExperience,
}: CoachStatsProps) => (
    <View className="flex-row px-4 py-6 gap-x-10 border-y border-border dark:border-border-dark">
        <StatItem value={`$${pricePerLesson}`} label="per lesson" />
        <StatItem value={rating} label="rating" />
        <StatItem value={`${yearsOfExperience} years`} label="experience" />
    </View>
)