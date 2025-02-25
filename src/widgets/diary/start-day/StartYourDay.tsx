import { TransitionScreen } from '@widgets/transitions/TransitionContext'
import { TransitionLayout } from '@widgets/transitions/TransitionLayout'
import { PriorityForDay } from './screens/PriorityForDay'
import { SleepQualityStep } from './screens/SleepQualityStep'


export const StartYourDay = () => {
    const handleComplete = async () => {
        // Ваша логика завершения
    }


    const screens: TransitionScreen[] = [
        {
            key: 'screen-1',
            component: SleepQualityStep,
            canSkip: false,
            canBack: false,
        },
        {
            key: 'screen-2',
            component: PriorityForDay,
            canSkip: false,
            canBack: false,
        },
        {
            key: 'screen-3',
            component: SleepQualityStep,
            canSkip: false,
            canBack: false,
        },
        {
            key: 'screen-4',
            component: SleepQualityStep,
            canSkip: false,
            canBack: false,
        },
    ]


    return <TransitionLayout screens={screens} onComplete={handleComplete} />
}