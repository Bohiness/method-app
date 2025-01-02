
export interface Emotion {
  id: number;
  name: string;
  mood_level: number;
  icon: string;
}

export interface Factor {
  id: number;
  name: string;
  icon: string;
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