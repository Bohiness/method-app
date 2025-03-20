import { Angry, Frown, Laugh, Meh, Smile } from 'lucide-react-native'

export const useMood = () => {
    const moods = [
        {
            level: 1,
            label: 'diary.moodcheckin.moods.terrible',
            icon: (color: string) => <Angry size={32} color={color} />,
            range: [1, 20],
        },
        {
            level: 2,
            label: 'diary.moodcheckin.moods.bad',
            icon: (color: string) => <Frown size={32} color={color} />,
            range: [21, 40],
        },
        {
            level: 3,
            label: 'diary.moodcheckin.moods.normal',
            icon: (color: string) => <Meh size={32} color={color} />,
            range: [41, 60],
        },
        {
            level: 4,
            label: 'diary.moodcheckin.moods.good',
            icon: (color: string) => <Smile size={32} color={color} />,
            range: [61, 80],
        },
        {
            level: 5,
            label: 'diary.moodcheckin.moods.excellent',
            icon: (color: string) => <Laugh size={32} color={color} />,
            range: [81, 100],
        },
    ]

    return { moods }
}
