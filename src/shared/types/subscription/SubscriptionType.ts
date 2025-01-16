// src/shared/types/subscription/SubscriptionType.ts

export type SubscriptionTierType = 'free' | 'premium' | 'pro';

export interface SubscriptionType {
    id: string;
    tier: SubscriptionTierType;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
}

export interface SubscriptionStatusType {
    isActive: boolean;
    tier: SubscriptionTierType;
    expiresAt: string;
    autoRenew: boolean;
    cancelAtPeriodEnd: boolean;
}

// Интерфейс для работы с платежными системами
export interface PaymentProviderType {
    id: string;
    type: 'stripe' | 'yookassa';
    customerId?: string;
    subscriptionId?: string;
}

export interface SubscriptionStateType {
    plans: SubscriptionType[];
    currentPlan: SubscriptionType | null;
    status: SubscriptionStatusType | null;
    paymentProvider: PaymentProviderType | null;
}

