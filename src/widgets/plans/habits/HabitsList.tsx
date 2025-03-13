import { HabitItem } from '@entities/plans/habits/HabitItem'
import { useHabits } from '@shared/hooks/plans/useHabits'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'


export const HabitsList = () => {
    const { habits, isLoading, error } = useHabits()

    const { t } = useTranslation()


    return (
        <View className='flex-row gap-x-4 mt-6'>
            {habits && habits.map((habit) => (
                <HabitItem key={habit.id} habit={habit} />
            ))}
            <HabitItem isNew title={t('plans.habits.newHabit.title')} />
        </View>
    )
}