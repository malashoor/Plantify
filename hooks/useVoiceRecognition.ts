import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { useState, useEffect, useCallback } from 'react';

interface VoiceRecognitionState {
  isListening: boolean;
  results: string[];
  error: string | null;
  partialResults: string[];
}

export function useVoiceRecognition() {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    results: [],
    error: null,
    partialResults: [],
  });

  useEffect(() => {
    function onSpeechResults(e: SpeechResultsEvent) {
      setState(prev => ({
        ...prev,
        results: e.value ?? [],
      }));
    }

    function onSpeechPartialResults(e: SpeechResultsEvent) {
      setState(prev => ({
        ...prev,
        partialResults: e.value ?? [],
      }));
    }

    function onSpeechError(e: SpeechErrorEvent) {
      setState(prev => ({
        ...prev,
        error: e.error?.message || 'An error occurred',
        isListening: false,
      }));
    }

    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      await Voice.start('en-US');
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null,
        results: [],
        partialResults: [],
      }));
    } catch (e) {
      setState(prev => ({
        ...prev,
        error: e instanceof Error ? e.message : 'Failed to start voice recognition',
        isListening: false,
      }));
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      setState(prev => ({
        ...prev,
        isListening: false,
      }));
    } catch (e) {
      setState(prev => ({
        ...prev,
        error: e instanceof Error ? e.message : 'Failed to stop voice recognition',
        isListening: false,
      }));
    }
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
  };
} 