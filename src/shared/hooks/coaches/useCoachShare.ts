// src/shared/hooks/coach/useCoachShare.ts
import { ROUTES } from '@shared/constants/routes'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import { Share } from 'react-native'
import { useCoach } from './useCoach'

interface UseCoachShareOptions {
  /**
   * Включить/выключить тактильный отклик при шеринге
   * @default true
   */
  haptics?: boolean;
  
  /**
   * Базовый URL для генерации ссылки на профиль коуча
   * @default ROUTES.BASE + '/coach/'
   */
  baseUrl?: string;
}

interface ShareData {
  title: string;
  message: string;
  url: string;
}

export const useCoachShare = (coachId: number, options: UseCoachShareOptions = {}) => {
  const { t } = useTranslation();
  const {
    haptics = true,
    baseUrl = ROUTES.BASE + '/coach/'
  } = options;

  // Используем существующий хук для получения данных коуча
  const { coach, isPending, error } = useCoach(coachId);

  /**
   * Генерирует данные для шеринга на основе данных коуча
   */
  const generateShareData = (): ShareData => {
    if (!coach) {
      throw new Error('Coach data not available');
    }

    const { expert } = coach;
    const fullName = `${expert.first_name} ${expert.last_name}`;
    const coachUrl = `${baseUrl}${coach.id}`;

    return {
      title: t('coaches.coach.share.title', { name: fullName }),
      message: t('coaches.coach.share.message', {
        name: fullName,
        experience: coach.years_of_coaching,
        about: coach.about_me
      }),
      url: coachUrl
    };
  };

  /**
   * Открывает системное окно шеринга
   */
  const shareCoach = async () => {
    try {
      if (!coach) {
        throw new Error('Coach data not available');
      }

      if (haptics) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const shareData = generateShareData();

      const result = await Share.share({
        title: shareData.title,
        message: `${shareData.message}\n\n${shareData.url}`,
        url: shareData.url
      }, {
        dialogTitle: t('coaches.coach.share.dialog_title'),
        subject: shareData.title
      });

      return result;
    } catch (error) {
      console.error(t('coaches.coach.share.error'), error);
      throw error;
    }
  };

  return {
    shareCoach,
    isPending,
    error
  };
};