import React from 'react';

// src/features/onboarding/types/OnboardingTypes.ts
export interface OnboardingScreen {
    key: string;
    component: React.ComponentType;
    canSkip?: boolean;
    canBack?: boolean;
}

export interface OnboardingScreenProps {
    onNext?: () => Promise<void>;
    loading?: boolean;
    nextButtonText?: string;
}

export interface OnboardingData {
    age?: string;
    gender?: string;
    focus?: string;
    first_name?: string;
    notifications?: {
        morning: {
            enabled: boolean;
            time: number;
        };
        evening: {
            enabled: boolean;
            time: number;
        };
    };
}
