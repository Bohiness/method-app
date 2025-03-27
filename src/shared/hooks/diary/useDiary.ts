import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useEveningReflectionHistory } from '@shared/hooks/diary/eveningreflection/useEveningReflection';
import { useJournalHistory } from '@shared/hooks/diary/journal/useJournal';
import { useMood } from '@shared/hooks/diary/mood/useMood';
import { useMoodHistory } from '@shared/hooks/diary/mood/useMoodCheckin';
import { useStartDayHistory } from '@shared/hooks/diary/startday/useStartDay';
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime';
import { EveningReflectionType } from '@shared/types/diary/eveningreflection/EveningReflectionType';
import { Journal, LocalJournal } from '@shared/types/diary/journal/JournalTypes';
import { MoodCheckin } from '@shared/types/diary/mood/MoodType';
import { StartDayType } from '@shared/types/diary/startday/StartDayType';

// Тип для объединенных записей с указанием типа записи
export type DiaryEntry = {
    id: number | string;
    type: 'mood' | 'startDay' | 'eveningReflection' | 'journal';
    created_at: string;
    data: MoodCheckin | StartDayType | EveningReflectionType | Journal | LocalJournal;
};

// Расширенные вспомогательные методы для работы с настроением
export const diaryHelpers = {
    // Получить эмодзи для уровня настроения
    getMoodEmoji: (level: number): string => {
        const emojis = ['😞', '😔', '😐', '🙂', '😄'];
        const idx = Math.min(Math.max(0, Math.floor(level)), 4);
        return emojis[idx];
    },

    // Получить описание настроения
    getMoodDescription: (level: number, t: (key: string) => string, moods: any[] = []): string => {
        // Если есть moods, используем их
        if (moods && moods.length) {
            // Определяем соответствующее настроение по уровню
            const mood = moods.find(m => m.level === level);
            if (mood) {
                return t(mood.label);
            }
        }

        // Запасной вариант (если moods не передан)
        const descriptions = [
            t('diary.moodcheckin.moods.terrible'),
            t('diary.moodcheckin.moods.bad'),
            t('diary.moodcheckin.moods.normal'),
            t('diary.moodcheckin.moods.good'),
            t('diary.moodcheckin.moods.excellent'),
        ];
        const idx = Math.min(Math.max(0, Math.floor(level) - 1), 4);
        return descriptions[idx];
    },

    // Получить имена эмоций
    getEmotionNames: (emotionIds: number[], emotions: any): string[] => {
        if (!emotionIds || !emotions) return [];
        return emotionIds
            .map(id => {
                const emotion = emotions.find((e: any) => e.id === id);
                return emotion ? emotion.name : '';
            })
            .filter(Boolean);
    },

    // Получить имена факторов
    getFactorNames: (factorIds: number[], factors: any): string[] => {
        if (!factorIds || !factors) return [];
        return factorIds
            .map(id => {
                const factor = factors.find((f: any) => f.id === id);
                return factor ? factor.name : '';
            })
            .filter(Boolean);
    },
};

// Основной хук useDiary
export const useDiary = () => {
    const { t } = useTranslation();
    const { moods } = useMood();
    const { data: moodCheckins, isPending: isMoodPending, error: moodError } = useMoodHistory();
    const { data: startDayEntries, isPending: isStartDayPending, error: startDayError } = useStartDayHistory();
    const {
        data: eveningReflectionEntries,
        isPending: isEveningReflectionPending,
        error: eveningReflectionError,
    } = useEveningReflectionHistory();
    const { data: journalEntries, isPending: isJournalPending, error: journalError } = useJournalHistory();
    const { formatDateTimeWithTimezoneAndLocale } = useDateTime();

    // Обновляем diaryHelpers для использования в контексте этого хука
    const contextDiaryHelpers = useMemo(() => {
        return {
            ...diaryHelpers,
            getMoodDescription: (level: number, translationFn: (key: string) => string) =>
                diaryHelpers.getMoodDescription(level, translationFn, moods),
        };
    }, [moods]);

    // Объединяем все записи и сортируем их по дням
    const entriesByDay = useMemo(() => {
        // Создаем массив для всех записей
        const allEntries: DiaryEntry[] = [];

        // Добавляем записи Mood
        if (moodCheckins && Array.isArray(moodCheckins)) {
            moodCheckins.forEach(entry => {
                allEntries.push({
                    id: entry.id,
                    type: 'mood',
                    created_at: entry.created_at,
                    data: entry,
                });
            });
        }

        // Добавляем записи StartDay
        if (startDayEntries && Array.isArray(startDayEntries)) {
            startDayEntries.forEach(entry => {
                allEntries.push({
                    id: entry.id,
                    type: 'startDay',
                    created_at: entry.created_at,
                    data: entry,
                });
            });
        }

        // Добавляем записи EveningReflection
        if (eveningReflectionEntries && Array.isArray(eveningReflectionEntries)) {
            eveningReflectionEntries.forEach(entry => {
                allEntries.push({
                    id: entry.id,
                    type: 'eveningReflection',
                    created_at: entry.created_at,
                    data: entry,
                });
            });
        }

        // Добавляем записи Journal
        if (journalEntries && Array.isArray(journalEntries)) {
            journalEntries.forEach(entry => {
                const journalId = entry.id || ('local_id' in entry ? (entry as LocalJournal).local_id : 0);
                allEntries.push({
                    id: journalId,
                    type: 'journal',
                    created_at: entry.created_at,
                    data: entry,
                });
            });
        }

        // Фильтруем записи за последнюю неделю
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);

        const filtered = allEntries.filter(entry => new Date(entry.created_at) >= weekAgo);

        // Группируем по дням
        const groupedByDay = filtered.reduce((acc, entry) => {
            const day = formatDateTimeWithTimezoneAndLocale(entry.created_at, 'dd MMMM');
            if (!acc[day]) acc[day] = [];
            acc[day].push(entry);
            return acc;
        }, {} as Record<string, DiaryEntry[]>);

        // Сортируем записи внутри каждого дня по времени создания (сначала новые)
        Object.keys(groupedByDay).forEach(day => {
            groupedByDay[day].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        });

        return groupedByDay;
    }, [moodCheckins, startDayEntries, eveningReflectionEntries, journalEntries, formatDateTimeWithTimezoneAndLocale]);

    // Возвращаем результат
    return {
        entriesByDay,
        isPending: isMoodPending || isStartDayPending || isEveningReflectionPending || isJournalPending,
        error: moodError || startDayError || eveningReflectionError || journalError,
        diaryHelpers: contextDiaryHelpers,
        moods,
    };
};
