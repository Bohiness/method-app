import { logger } from '@shared/lib/logger/logger.service';
import { PurchasesPackage } from 'react-native-purchases';

// Тип плана подписки
export type SubscriptionPlan = 'premium' | 'premium_ai';
export type SubscriptionPeriod = 'monthly' | 'annually';

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
    montly_trial_period_days?: number;
    annually_trial_period_days?: number;
    revenuecat_package_monthly?: PurchasesPackage;
    revenuecat_package_annually?: PurchasesPackage;
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

    // Обновленная функция для сопоставления пакета RevenueCat с планом и периодом
    const mapPackageToPlanInfo = (
        pkg: PurchasesPackage
    ): { planType: SubscriptionPlan | null; period: SubscriptionPeriod | null } => {
        const identifier = pkg.product.identifier.toLowerCase();

        // Точное сопоставление по ID
        switch (identifier) {
            case 'premium_monthly':
                return { planType: 'premium', period: 'monthly' };
            case 'premium_v1': // Предполагаем, что _v1 это годовой
                return { planType: 'premium', period: 'annually' };
            case 'premium_ai_monthly':
                return { planType: 'premium_ai', period: 'monthly' };
            case 'premium_ai_v1': // Предполагаем, что _v1 это годовой
                return { planType: 'premium_ai', period: 'annually' };
            default:
                // Дополнительно можно проверить по типу пакета, если ID не совпали
                const isAnnualPackageType = pkg.packageType.toLowerCase().includes('annual');
                if (identifier.includes('premium_ai')) {
                    return { planType: 'premium_ai', period: isAnnualPackageType ? 'annually' : 'monthly' };
                } else if (identifier.includes('premium')) {
                    return { planType: 'premium', period: isAnnualPackageType ? 'annually' : 'monthly' };
                }
                return { planType: null, period: null };
        }
    };

    // Создаем результирующие планы с информацией о ценах
    const result: Record<SubscriptionPlan, SubscriptionPlanInfo> = {
        premium: {
            ...plansMetadata.premium,
            // Убрали запасные значения, они будут заполнены из RevenueCat или останутся undefined
            montly_trial_period_days: 0, // Значения по умолчанию для триалов
            annually_trial_period_days: 0,
        },
        premium_ai: {
            ...plansMetadata.premium_ai,
            // Убрали запасные значения
            montly_trial_period_days: 0, // Значения по умолчанию для триалов
            annually_trial_period_days: 0,
        },
    };

    // Если есть пакеты из RevenueCat, дополняем ими информацию
    if (packages && packages.length > 0) {
        packages.forEach(pkg => {
            const { planType, period } = mapPackageToPlanInfo(pkg); // Используем обновленную функцию

            if (planType && period) {
                const priceString = pkg.product.priceString;
                // Получаем дни триала ИЗ пакета
                const trialDurationDays = pkg.product.introPrice?.periodNumberOfUnits || 0;
                // Определяем единицу измерения триала (если нужно, но обычно это дни)
                // const trialPeriodUnit = pkg.product.introPrice?.periodUnit; // e.g., "DAY", "WEEK", "MONTH", "YEAR"

                // Важно: Проверяем, относится ли триал к этому конкретному пакету
                // RevenueCat может возвращать один introPrice для продукта,
                // нужно убедиться, что он применяется к правильному периоду (месяц/год)
                // В простейшем случае, предполагаем, что если триал есть, он применим
                const hasTrial = trialDurationDays > 0;

                if (period === 'annually') {
                    result[planType].price_annually = priceString;

                    // Пытаемся получить числовое значение цены
                    const priceValue = pkg.product.price; // price обычно уже number

                    // Проверяем, что это валидное положительное число
                    if (typeof priceValue === 'number' && !isNaN(priceValue) && priceValue > 0) {
                        // Рассчитываем и форматируем месячную цену
                        result[planType].monthly_price_in_annual = `$${(priceValue / 12).toFixed(2)}`;
                        // --- ДОБАВЬ ЛОГ ЗДЕСЬ ---
                        logger.debug(
                            `Calculated monthly_price_in_annual: ${result[planType].monthly_price_in_annual} for ${planType} from annual price ${priceValue}`,
                            'getSubscriptionPlans'
                        );
                        // ------------------------
                    } else {
                        // --- ДОБАВЬ ЛОГ ЗДЕСЬ ---
                        logger.warn(
                            `Could not calculate monthly_price_in_annual for ${planType}. pkg.product.price was: ${priceValue}`,
                            'getSubscriptionPlans'
                        );
                        // ------------------------
                        // Можно установить дефолтное значение или оставить undefined
                        // result[planType].monthly_price_in_annual = '$?.??';
                    }
                    result[planType].revenuecat_package_annually = pkg;
                    // Применяем триал, если он есть
                    if (hasTrial) {
                        result[planType].annually_trial_period_days = trialDurationDays;
                    }
                } else {
                    // period === 'monthly'
                    result[planType].price_monthly = priceString;
                    // Сохраняем месячный пакет
                    result[planType].revenuecat_package_monthly = pkg;
                    // Применяем триал, если он есть
                    if (hasTrial) {
                        result[planType].montly_trial_period_days = trialDurationDays;
                    }
                }
            }
        });
    }

    // Добавим запасные значения, если RevenueCat не вернул цены (на случай ошибок)
    if (!result.premium.price_monthly) result.premium.price_monthly = '$4.99';
    if (!result.premium.price_annually) {
        result.premium.price_annually = '$19.99';
        // Рассчитываем запасное monthly_price_in_annual на основе запасного годового
        result.premium.monthly_price_in_annual = `$${(19.99 / 12).toFixed(2)}`;
    }
    if (!result.premium_ai.price_monthly) result.premium_ai.price_monthly = '$14.99';
    if (!result.premium_ai.price_annually) {
        result.premium_ai.price_annually = '$99.99';
        // Рассчитываем запасное monthly_price_in_annual на основе запасного годового
        result.premium_ai.monthly_price_in_annual = `$${(99.99 / 12).toFixed(2)}`;
    }

    // Можно также установить запасные триалы, если нужно
    if (result.premium.annually_trial_period_days === 0) result.premium.annually_trial_period_days = 3;
    if (result.premium_ai.annually_trial_period_days === 0) result.premium_ai.annually_trial_period_days = 3;

    return result;
};
