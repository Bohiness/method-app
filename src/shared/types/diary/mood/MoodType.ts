import { IconName } from '@shared/ui/icon';

export interface Emotion {
    id: number;
    name: string;
    description: string;
    mood_level: number;
    icon: IconName;
}

export interface Factor {
    id: number;
    name: string;
    icon: IconName;
}

export interface MoodCheckin {
    id: number;
    mood_level: number;
    emotions: number[];
    factors: number[];
    factor_review_notes: string;
    factor_emotion_review_notes: string;
    created_at: string;
    date?: Date;
}
