import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './themed/Text';
import { compressImage, cleanup } from '../utils/imageProcessing';

interface ImageProcessorProps {
  uri: string;
  onComplete: (uri: string) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

export default function ImageProcessor({
  uri,
  onComplete,
  onError,
  maxRetries = 3,
}: ImageProcessorProps) {
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const process = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newUri = await compressImage(uri);
      onComplete(newUri);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [uri, onComplete, onError]);

  useEffect(() => {
    process();
    return () => cleanup(uri);
  }, [process, uri, retryCount]);

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Processing image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Processing failed</Text>
        {retryCount < maxRetries && (
          <TouchableOpacity style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>
              Retry ({maxRetries - retryCount} attempts remaining)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Processing complete!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
});
