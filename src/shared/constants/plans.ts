import { PurchasesPackage } from 'react-native-purchases';

// Тип плана подписки
export type SubscriptionPlan = 'premium' | 'premium_ai';

// Интерфейс для метаданных плана
export interface PlanMetadata {
    title: string;
    description: string;
    items: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
}

// Интерфейс для полной информации о плане, включая данные из RevenueCat
export interface SubscriptionPlanInfo extends PlanMetadata {
    price_monthly?: string;
    price_annually?: string;
    monthly_price_in_annual?: string;
    trial_period_days?: number;
    revenuecat_package?: PurchasesPackage;
}

// Функция для получения данных о планах с учетом данных из RevenueCat
export const getSubscriptionPlans = (
    t: (key: string) => string,
    packages?: PurchasesPackage[]
): Record<SubscriptionPlan, SubscriptionPlanInfo> => {
    // Базовые метаданные планов (без цен)
    const plansMetadata: Record<SubscriptionPlan, PlanMetadata> = {
        premium: {
            title: t('screens.subscription.plans.premium.title'),
            description: t('screens.subscription.plans.premium.description'),
            items: [
                {
                    icon: 'Calendar',
                    title: t('screens.subscription.plans.premium.features.planning.title'),
                    description: t('screens.subscription.plans.premium.features.planning.description'),
                },
                {
                    icon: 'Target',
                    title: t('screens.subscription.plans.premium.features.goals.title'),
                    description: t('screens.subscription.plans.premium.features.goals.description'),
                },
                {
                    icon: 'Blend',
                    title: t('screens.subscription.plans.premium.features.habits.title'),
                    description: t('screens.subscription.plans.premium.features.habits.description'),
                },
                {
                    icon: 'Zap',
                    title: t('screens.subscription.plans.premium.features.analytics.title'),
                    description: t('screens.subscription.plans.premium.features.analytics.description'),
                },
                {
                    icon: 'MessageCircle',
                    title: t('screens.subscription.plans.premium.features.motivation.title'),
                    description: t('screens.subscription.plans.premium.features.motivation.description'),
                },
                {
                    icon: 'Bell',
                    title: t('screens.subscription.plans.premium.features.reminders.title'),
                    description: t('screens.subscription.plans.premium.features.reminders.description'),
                },
                {
                    icon: 'BrainCircuit',
                    title: t('screens.subscription.plans.premium.features.state.title'),
                    description: t('screens.subscription.plans.premium.features.state.description'),
                },
            ],
        },
        premium_ai: {
            title: t('screens.subscription.plans.premium_ai.title'),
            description: t('screens.subscription.plans.premium_ai.description'),
            items: [
                {
                    icon: 'Plus',
                    title: t('screens.subscription.plans.premium_ai.features.premium.title'),
                    description: t('screens.subscription.plans.premium_ai.features.premium.description'),
                },
                {
                    icon: 'Mic',
                    title: t('screens.subscription.plans.premium_ai.features.voice.title'),
                    description: t('screens.subscription.plans.premium_ai.features.voice.description'),
                },
                {
                    icon: 'CalendarClock',
                    title: t('screens.subscription.plans.premium_ai.features.voiceTasks.title'),
                    description: t('screens.subscription.plans.premium_ai.features.voiceTasks.description'),
                },
                {
                    icon: 'Sparkles',
                    title: t('screens.subscription.plans.premium_ai.features.smartInput.title'),
                    description: t('screens.subscription.plans.premium_ai.features.smartInput.description'),
                },
                {
                    icon: 'Bot',
                    title: t('screens.subscription.plans.premium_ai.features.aiAnalytics.title'),
                    description: t('screens.subscription.plans.premium_ai.features.aiAnalytics.description'),
                },
                {
                    icon: 'BrainCircuit',
                    title: t('screens.subscription.plans.premium_ai.features.smartReminders.title'),
                    description: t('screens.subscription.plans.premium_ai.features.smartReminders.description'),
                },
            ],
        },
    };

    // Функция для сопоставления пакета RevenueCat с планом
    const mapPackageToPlan = (pkg: PurchasesPackage): SubscriptionPlan | null => {
        const identifier = pkg.product.identifier.toLowerCase();

        if (identifier.includes('premium_ai')) {
            return 'premium_ai';
        } else if (identifier.includes('premium')) {
            return 'premium';
        }

        return null;
    };

    // Создаем результирующие планы с информацией о ценах
    const result: Record<SubscriptionPlan, SubscriptionPlanInfo> = {
        premium: {
            ...plansMetadata.premium,
            price_monthly: '$9.99', // Запасные значения
            price_annually: '$19.99',
            trial_period_days: 7,
        },
        premium_ai: {
            ...plansMetadata.premium_ai,
            price_monthly: '$19.99', // Запасные значения
            price_annually: '$99.99',
            trial_period_days: 7,
        },
    };

    // Если есть пакеты из RevenueCat, дополняем ими информацию
    if (packages && packages.length > 0) {
        packages.forEach(pkg => {
            const planType = mapPackageToPlan(pkg);

            if (planType) {
                const priceString = pkg.product.priceString;
                const trialDuration = pkg.product.introPrice?.periodNumberOfUnits || 0;

                // Определяем, годовой это пакет или месячный
                const isAnnual =
                    pkg.product.subscriptionPeriod?.toLowerCase().includes('year') ||
                    pkg.packageType.toLowerCase().includes('annual');

                if (isAnnual) {
                    result[planType].price_annually = priceString;

                    // Рассчитываем месячную цену в годовой подписке
                    const priceValue = parseFloat(pkg.product.price.toString());
                    result[planType].monthly_price_in_annual = `$${(priceValue / 12).toFixed(2)}`;
                } else {
                    result[planType].price_monthly = priceString;
                }

                // Устанавливаем пробный период, если он есть
                if (trialDuration > 0) {
                    result[planType].trial_period_days = trialDuration;
                }

                // Сохраняем ссылку на пакет RevenueCat для использования при покупке
                result[planType].revenuecat_package = pkg;
            }
        });
    }

    return result;
};
