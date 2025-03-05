export interface EveningReflectionType {
    id: string;
    date: string;
    created_at: string;
    mood_score: number | null;
    positive_aspects: string | null;
    improvement_areas: string | null;
    lesson_learned: string | null;
    additional_thoughts: string | null;
    is_synced?: boolean;
    is_deleted?: boolean;
}
