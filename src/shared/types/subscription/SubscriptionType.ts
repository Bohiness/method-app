// src/shared/types/subscription/SubscriptionType.ts

export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface SubscriptionPlan {
    id: string;
    tier: SubscriptionTier;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
}

export interface SubscriptionStatus {
    isActive: boolean;
    tier: SubscriptionTier;
    expiresAt: string;
    autoRenew: boolean;
    cancelAtPeriodEnd: boolean;
}

// Интерфейс для работы с платежными системами
export interface PaymentProvider {
    id: string;
    type: 'stripe' | 'yookassa';
    customerId?: string;
    subscriptionId?: string;
}

export interface SubscriptionState {
    currentPlan: SubscriptionPlan | null;
    status: SubscriptionStatus | null;
    paymentProvider: PaymentProvider | null;
}

