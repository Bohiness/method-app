Пример использования логгера

import { useLogger } from '@shared/hooks/useLogger';

export const ProfileModal = (props: ProfileModalProps) => {
  const logger = useLogger('ProfileModal', props);
  const [state, setState] = useState(initialState);

  useEffect(() => {
    logger.debug('State changed', { newState: state });
  }, [state]);

  const handleSubmit = async () => {
    try {
      logger.info('Submitting profile data', { data: state });
      // ... логика отправки
    } catch (error) {
      logger.error('Failed to submit profile', 'ProfileModal', error);
    }
  };

  return (
    // ... jsx
  );
};