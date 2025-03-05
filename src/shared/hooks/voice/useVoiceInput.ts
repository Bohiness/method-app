import { useAI } from '@shared/hooks/ai/useAI';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseVoiceInputProps {
    enabled?: boolean;
    url?: string;
}
export const useVoiceInput = ({ enabled = true, url }: UseVoiceInputProps = {}) => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const levelCheckInterval = useRef<NodeJS.Timeout | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);

    const { sendVoice, isSending, currentResponse } = useAI({ url });

    const setupAudio = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                setError('Разрешения на использование микрофона не предоставлены');
                return false;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            setIsInitialized(true);
            return true;
        } catch (err) {
            setError('Ошибка при настройке аудио');
            return false;
        }
    };

    const startRecording = useCallback(async () => {
        if (!enabled && isInitialized) return;

        try {
            setError(null);
            setIsRecording(true);

            if (!isInitialized) {
                const success = await setupAudio();
                if (!success) {
                    setIsRecording(false);
                    return;
                }
            }

            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

            recordingRef.current = recording;
            setRecording(recording);

            levelCheckInterval.current = setInterval(async () => {
                if (!recordingRef.current) return;
                try {
                    const status = await recordingRef.current.getStatusAsync();
                    const meteringValue = status.metering ?? 0;
                    setAudioLevel(Math.min(1, Math.max(0, meteringValue / 100 + 0.5)));
                } catch (err) {
                    console.error('Error getting audio level:', err);
                }
            }, 100);
        } catch (err) {
            setError('Ошибка при начале записи');
            setIsRecording(false);
        }
    }, [enabled, isInitialized]);

    const stopRecording = useCallback(async () => {
        const currentRecording = recordingRef.current;
        if (!currentRecording) return;

        if (levelCheckInterval.current) {
            clearInterval(levelCheckInterval.current);
            levelCheckInterval.current = null;
        }

        try {
            await currentRecording.stopAndUnloadAsync();
            const uri = currentRecording.getURI();
            if (!uri) throw new Error('URI записи не найден');

            const audioFile = {
                uri,
                type: 'audio/m4a',
                name: 'audio.m4a',
            } as any;

            const response = await sendVoice(audioFile);
            console.log('response from useVoiceInput', response);
            return response;
        } catch (err) {
            setError('Ошибка при остановке записи');
        } finally {
            recordingRef.current = null;
            setRecording(null);
            setIsRecording(false);
            setAudioLevel(0);
        }
    }, [sendVoice]);

    useEffect(() => {
        return () => {
            if (levelCheckInterval.current) {
                clearInterval(levelCheckInterval.current);
            }
        };
    }, []);

    return {
        isRecording,
        isProcessing: isSending,
        response: currentResponse,
        error,
        audioLevel,
        startRecording,
        stopRecording,
        isInitialized,
    };
};
