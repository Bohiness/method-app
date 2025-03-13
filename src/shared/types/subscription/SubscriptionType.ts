// src/shared/types/subscription/SubscriptionType.ts

export type SubscriptionTier = 'free' | 'premium' | 'premium_ai';
export type SubscriptionPlan = 'premium' | 'premium_ai';

export interface SubscriptionStatus {
    isActive: boolean;
    tier: SubscriptionTier;
    expiresAt: string;
    autoRenew: boolean;
    cancelAtPeriodEnd: boolean;
}

export interface SubscriptionPackage {
    identifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
    period: string;
    features: string[];
}

export interface SubscriptionOffering {
    identifier: string;
    packages: SubscriptionPackage[];
}
