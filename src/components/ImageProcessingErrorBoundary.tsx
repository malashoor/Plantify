import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ImageProcessingError } from '../utils/imageProcessing';
import { useAnalytics } from '../hooks/useAnalytics';

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorDisplay: React.FC<{
  error: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  const { trackError } = useAnalytics();

  React.useEffect(() => {
    if (error) {
      trackError(error, {
        component: 'ImageProcessingErrorBoundary',
        errorType: error instanceof ImageProcessingError ? error.code : 'UNKNOWN'
      });
    }
  }, [error]);

  const getMessage = (error: Error) => {
    if (error instanceof ImageProcessingError) {
      switch (error.code) {
        case 'FILE_TOO_LARGE':
          return 'The image file is too large. Please choose a smaller image or try compressing it first.';
        case 'INSUFFICIENT_MEMORY':
          return 'Not enough memory available. Please close some apps and try again.';
        case 'FILE_NOT_FOUND':
          return 'The image file could not be found. Please try selecting it again.';
        case 'PROCESSING_FAILED':
          return 'Failed to process the image. Please try again with a different image.';
        default:
          return 'An error occurred while processing the image. Please try again.';
      }
    }
    return 'An unexpected error occurred. Please try again.';
  };

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Image Processing Error</Text>
      <Text style={styles.errorMessage}>{getMessage(error)}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export class ImageProcessingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorDisplay
          error={this.state.error}
          onRetry={this.props.onRetry ? this.handleRetry : undefined}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center'
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#e74c3c'
  },
  errorMessage: {
    fontSize: 14,
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
}); 