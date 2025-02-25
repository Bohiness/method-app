import { Title } from '@shared/ui/text'
import { TransitionScreen } from '@widgets/transitions/TransitionContext'
import { TransitionLayout } from '@widgets/transitions/TransitionLayout'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UniversalScreen } from 'src/features/screens/UniversalScreen'
import { HowIsYourDay } from './screens/HowIsYourDay'

export const EveningReflection = () => {
    const { t } = useTranslation()
    const [screen1Response, setScreen1Response] = useState('')
    const [screen2Response, setScreen2Response] = useState('')
    const [screen3Response, setScreen3Response] = useState('')
    const [screen4Response, setScreen4Response] = useState('')
    const [screen5Response, setScreen5Response] = useState('')

    const screens: TransitionScreen<any>[] = [
        {
            key: 'screen-1',
            component: HowIsYourDay,
            canSkip: false,
            canBack: false,
            props: {
                initialValue: 50,
                setEnabledNextButton: (enabled: boolean) => { },
                onChange: (value: number) => { /* логика */ },
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
    ]

    const handleComplete = async () => {
        // Здесь можно обработать отправку данных или их сохранение
        console.log({
            screen1Response,
            screen2Response,
            screen3Response,
            screen4Response,
            screen5Response,
        })
    }

    return <TransitionLayout screens={screens} onComplete={handleComplete} />
}