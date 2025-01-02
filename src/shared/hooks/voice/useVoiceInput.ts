// src/shared/hooks/voice/useVoiceInput.ts

import { apiClient } from '@shared/config/api-client'
import { Audio } from 'expo-av'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseVoiceInputProps {
    onTranscribe: (text: string, shouldAppend?: boolean) => void; 
}

export const useVoiceInput = ({ onTranscribe }: UseVoiceInputProps) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Храним идентификатор интервала для метеринга звука
  const levelCheckInterval = useRef<NodeJS.Timeout | null>(null);


  /**
   * Запрашиваем разрешения и настраиваем аудио при монтировании.
   */
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Запрашиваем разрешения
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          setError('Разрешения на использование микрофона не предоставлены');
          return;
        }

        // Настраиваем аудио-мод
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (err) {
        setError('Ошибка при настройке аудио');
        console.error('Error setting up audio:', err);
      }
    };

    setupAudio();

    // При размонтировании удаляем таймер
    return () => {
      if (levelCheckInterval.current) {
        clearInterval(levelCheckInterval.current);
      }
    };
  }, []);

  /**
   * Начать запись.
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Создаём объект записи со всеми нужными опциями
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY );

      setRecording(recording);
      setIsRecording(true);

      levelCheckInterval.current = setInterval(async () => {
        try {
          if (!recording) return;

          const status = await recording.getStatusAsync();
          const meteringValue = status.metering ?? 0;
        //   console.log('Raw metering value:', meteringValue);
          
          const normalizedLevel = Math.min(1, Math.max(0, meteringValue / 100 + 0.5));
        //   console.log('Normalized audio level:', normalizedLevel);
          
          setAudioLevel(normalizedLevel);
        } catch (err) {
          console.error('Error getting audio level:', err);
        }
      }, 100);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Ошибка при начале записи');
    }
  }, []);

  /**
   * Остановить запись и отправить аудиофайл на бэкенд.
   */
  const stopRecording = useCallback(async () => {
    if (!recording) return;

    // Останавливаем измерение уровня громкости
    if (levelCheckInterval.current) {
      clearInterval(levelCheckInterval.current);
      levelCheckInterval.current = null;
    }

    setIsProcessing(true);
    try {
      await recording.stopAndUnloadAsync(); 
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('URI записи не найден');
      }

      // Подготовка к отправке файла на сервер
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);

      // Отправляем файл и ждём расшифровки
      const response = await apiClient.post<{ text: string }>(
        '/api/openai/transcribe/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Вызываем колбэк с полученным текстом
      onTranscribe(response.text.trim(), true);
    } catch (err) {
      console.error('Error processing recording:', err);
      setError('Ошибка при остановке записи');
    } finally {
      // Сбрасываем состояние
      setRecording(null);
      setIsRecording(false);
      setIsProcessing(false);
      setAudioLevel(0);
    }
  }, [recording, onTranscribe]);

  return {
    isRecording,
    isProcessing,
    error,
    audioLevel,
    startRecording,
    stopRecording,
  };
};