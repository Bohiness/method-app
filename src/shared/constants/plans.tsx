export const getSubscriptionPlans = (t: (key: string) => string) => ({
    premium: {
        title: t('screens.subscription.plans.premium.title'),
        description: t('screens.subscription.plans.premium.description'),
        price_annually: '$16.71',
        trial_period_days: 7,
        items: [
            {
                icon: 'Calendar',
                title: t('screens.subscription.plans.premium.features.planning.title'),
                description: t('screens.subscription.plans.premium.features.planning.description')
            },
            {
                icon: 'Target',
                title: t('screens.subscription.plans.premium.features.goals.title'),
                description: t('screens.subscription.plans.premium.features.goals.description')
            },
            {
                icon: 'Blend',
                title: t('screens.subscription.plans.premium.features.habits.title'),
                description: t('screens.subscription.plans.premium.features.habits.description')
            },
            {
                icon: 'Zap',
                title: t('screens.subscription.plans.premium.features.analytics.title'),
                description: t('screens.subscription.plans.premium.features.analytics.description')
            },
            {
                icon: 'MessageCircle',
                title: t('screens.subscription.plans.premium.features.motivation.title'),
                description: t('screens.subscription.plans.premium.features.motivation.description')
            },
            {
                icon: 'Bell',
                title: t('screens.subscription.plans.premium.features.reminders.title'),
                description: t('screens.subscription.plans.premium.features.reminders.description')
            },
            {
                icon: 'BrainCircuit',
                title: t('screens.subscription.plans.premium.features.state.title'),
                description: t('screens.subscription.plans.premium.features.state.description')
            }
        ]
    },
    premium_ai: {
        title: t('screens.subscription.plans.premium_ai.title'),
        description: t('screens.subscription.plans.premium_ai.description'),
        price_annually: '$86.13',
        trial_period_days: 7,
        items: [
            {
                icon: 'Plus',
                title: t('screens.subscription.plans.premium_ai.features.premium.title'),
                description: t('screens.subscription.plans.premium_ai.features.premium.description')
            },
            {
                icon: 'Mic',
                title: t('screens.subscription.plans.premium_ai.features.voice.title'),
                description: t('screens.subscription.plans.premium_ai.features.voice.description')
            },
            {
                icon: 'CalendarClock',
                title: t('screens.subscription.plans.premium_ai.features.voiceTasks.title'),
                description: t('screens.subscription.plans.premium_ai.features.voiceTasks.description')
            },
            {
                icon: 'Sparkles',
                title: t('screens.subscription.plans.premium_ai.features.smartInput.title'),
                description: t('screens.subscription.plans.premium_ai.features.smartInput.description')
            },
            {
                icon: 'Bot',
                title: t('screens.subscription.plans.premium_ai.features.aiAnalytics.title'),
                description: t('screens.subscription.plans.premium_ai.features.aiAnalytics.description')
            },
            {
                icon: 'BrainCircuit',
                title: t('screens.subscription.plans.premium_ai.features.smartReminders.title'),
                description: t('screens.subscription.plans.premium_ai.features.smartReminders.description')
            }
        ]
    }
})