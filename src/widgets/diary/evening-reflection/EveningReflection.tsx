import { useEveningReflection } from '@shared/hooks/diary/eveningreflection/useEveningReflection'
import { Title } from '@shared/ui/text'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UniversalScreen } from 'src/features/screens/UniversalScreen'
import { HowIsYourDay } from './screens/HowIsYourDay'
import { SuccessStepEveningReflection } from './screens/SuccessStep'
export const EveningReflection = () => {
    const { t } = useTranslation()
    const [screen1Response, setScreen1Response] = useState<number>()
    const [screen2Response, setScreen2Response] = useState<string>()
    const [screen3Response, setScreen3Response] = useState<string>()
    const [screen4Response, setScreen4Response] = useState<string>()
    const [screen5Response, setScreen5Response] = useState<string>()
    const { create: createEveningReflection } = useEveningReflection()

    const screens = [
        {
            key: 'screen-1',
            component: HowIsYourDay,
            canSkip: false,
            canBack: false,
            props: {
                initialValue: 50,
                setEnabledNextButton: (enabled: boolean) => { },
                onChange: (value: number) => {
                    setScreen1Response(value)
                },
            },
        },
        {
            key: 'screen-2',
            component: UniversalScreen,
            props: {
                topContent: (
                    <Title align='center' className='mb-4'>
                        {t('diary.eveningreflection.question2.title')}
                    </Title>
                ),
                inputValue: screen2Response,
                onInputChange: setScreen2Response,
                placeholder: t('diary.eveningreflection.question2.placeholder'),
            },
        },
        {
            key: 'screen-3',
            component: UniversalScreen,
            props: {
                topContent: (
                    <Title align='center' className='mb-4'>
                        {t('diary.eveningreflection.question3.title')}
                    </Title>
                ),
                inputValue: screen3Response,
                onInputChange: setScreen3Response,
                placeholder: t('diary.eveningreflection.question3.placeholder'),
            },
        },
        {
            key: 'screen-4',
            component: UniversalScreen,
            props: {
                topContent: (
                    <Title align='center' className='mb-4'>
                        {t('diary.eveningreflection.question4.title')}
                    </Title>
                ),
                inputValue: screen4Response,
                onInputChange: setScreen4Response,
                placeholder: t('diary.eveningreflection.question4.placeholder'),
            },
        },
        {
            key: 'screen-5',
            component: UniversalScreen,
            props: {
                topContent: (
                    <Title align='center' className='mb-4'>
                        {t('diary.eveningreflection.question5.title')}
                    </Title>
                ),
                inputValue: screen5Response,
                onInputChange: setScreen5Response,
                placeholder: t('diary.eveningreflection.question5.placeholder'),
            },
        },
        {
            key: 'screen-6',
            component: SuccessStepEveningReflection,
        },
    ]

    const handleComplete = async () => {
        console.log({
            screen1Response,
            screen2Response,
            screen3Response,
            screen4Response,
            screen5Response,
        })
        await createEveningReflection.mutateAsync({
            mood_score: screen1Response ?? null,
            positive_aspects: screen2Response ?? null,
            improvement_areas: screen3Response ?? null,
            lesson_learned: screen4Response ?? null,
            additional_thoughts: screen5Response ?? null,
        })
        router.back()
    }
    return <TransitionLayout screens={screens} onComplete={handleComplete} />
}