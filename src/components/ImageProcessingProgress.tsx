import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Modal from 'react-native/Libraries/Modal/Modal';
import { useAnalytics } from '../hooks/useAnalytics';
import { ImageProcessingError } from '../utils/imageProcessing';
import { AnalyticsEvent } from '../types/analytics';

type ProcessingStatus = 'idle' | 'processing' | 'error' | 'completed';

interface ImageProcessingProgressProps {
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
  error?: Error | null;
  progress?: number;
  status: ProcessingStatus;
}

export const ImageProcessingProgress = ({
  visible,
  onClose,
  onRetry,
  error,
  progress = 0,
  status,
}: ImageProcessingProgressProps): JSX.Element => {
  const { trackEvent } = useAnalytics();
  const [retryCount, setRetryCount] = React.useState(0);
  const [showRetryButton, setShowRetryButton] = React.useState(true);

  React.useEffect(() => {
    if (status === 'error' && error) {
      trackEvent(AnalyticsEvent.ERROR_OCCURRED, {
        error_type: error instanceof ImageProcessingError ? error.code : 'UNKNOWN',
        error_message: error.message,
        retry_count: retryCount,
      });
    }
  }, [error, retryCount, status, trackEvent]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (retryCount >= 2) {
      setShowRetryButton(false);
    }
    onRetry();
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing your image...';
      case 'error':
        if (error instanceof ImageProcessingError) {
          switch (error.code) {
            case 'FILE_TOO_LARGE':
              return 'The image file is too large. Please choose a smaller image.';
            case 'DIMENSIONS_TOO_SMALL':
              return 'The image is too small. Please choose a larger image.';
            case 'PROCESSING_FAILED':
              return 'Failed to process the image. Please try again.';
            default:
              return 'An error occurred while processing the image.';
          }
        }
        return 'An unexpected error occurred.';
      case 'completed':
        return 'Image processing completed!';
      default:
        return '';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Image Processing</Text>

          <Text style={styles.message}>{getStatusMessage()}</Text>

          {status === 'processing' && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
            </View>
          )}

          {status === 'error' && showRetryButton && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          )}

          {(status === 'completed' || (status === 'error' && !showRetryButton)) && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  closeButton: {
    backgroundColor: '#666',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
