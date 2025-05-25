import { Ionicons } from '@expo/vector-icons';
import { Button } from '@rneui/themed';
import React, { useEffect } from 'react';

import { View, StyleSheet, ActivityIndicator } from 'react-native';

import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

interface VoiceInputProps {
  onTextChange: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTextChange, disabled }: VoiceInputProps) {
  const {
    isListening,
    results,
    error,
    partialResults,
    startListening,
    stopListening,
  } = useVoiceRecognition();

  useEffect(() => {
    if (results.length > 0) {
      onTextChange(results[0]);
    }
  }, [results, onTextChange]);

  const handlePress = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={handlePress}
        disabled={disabled}
        type="clear"
        icon={
          isListening ? (
            <ActivityIndicator color="#2089dc" />
          ) : (
            <Ionicons name="mic" size={24} color={disabled ? '#999' : '#2089dc'} />
          )
        }
        accessibilityLabel={isListening ? 'Stop voice recording' : 'Start voice recording'}
        accessibilityHint={
          isListening
            ? 'Double tap to stop recording your note'
            : 'Double tap to start recording your note using voice'
        }
        accessibilityState={{
          disabled,
          busy: isListening,
        }}
      />
      {error && (
        <View style={styles.errorContainer} accessibilityRole="alert">
          <Ionicons name="warning" size={16} color="#ff190c" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    marginLeft: 8,
  },
}); 