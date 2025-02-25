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
    premiumPlus: {
        title: t('screens.subscription.plans.premiumPlus.title'),
        description: t('screens.subscription.plans.premiumPlus.description'),
        price_annually: '$86.13',
        trial_period_days: 7,
        items: [
            {
                icon: 'Plus',
                title: t('screens.subscription.plans.premiumPlus.features.premium.title'),
                description: t('screens.subscription.plans.premiumPlus.features.premium.description')
            },
            {
                icon: 'Mic',
                title: t('screens.subscription.plans.premiumPlus.features.voice.title'),
                description: t('screens.subscription.plans.premiumPlus.features.voice.description')
            },
            {
                icon: 'CalendarClock',
                title: t('screens.subscription.plans.premiumPlus.features.voiceTasks.title'),
                description: t('screens.subscription.plans.premiumPlus.features.voiceTasks.description')
            },
            {
                icon: 'Sparkles',
                title: t('screens.subscription.plans.premiumPlus.features.smartInput.title'),
                description: t('screens.subscription.plans.premiumPlus.features.smartInput.description')
            },
            {
                icon: 'Bot',
                title: t('screens.subscription.plans.premiumPlus.features.aiAnalytics.title'),
                description: t('screens.subscription.plans.premiumPlus.features.aiAnalytics.description')
            },
            {
                icon: 'BrainCircuit',
                title: t('screens.subscription.plans.premiumPlus.features.smartReminders.title'),
                description: t('screens.subscription.plans.premiumPlus.features.smartReminders.description')
            }
        ]
    }
})