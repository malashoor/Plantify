import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAnalytics } from '../hooks/useAnalytics';
import { AnalyticsEvent } from '../types/analytics';
import { ImageProcessingErrorBoundary } from './ImageProcessingErrorBoundary';
import { 
  compressImage, 
  cleanupTemporaryImages, 
  validateImage,
  ProcessedImage,
  ImageProcessingError 
} from '../utils/imageProcessing';

interface PlantAnalyzerProps {
  imageUri?: string;
  onAnalysisComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

interface AnalysisResult {
  plantName: string;
  confidence: number;
  healthScore: number;
  recommendations: string[];
}

export const PlantAnalyzer: React.FC<PlantAnalyzerProps> = ({
  imageUri,
  onAnalysisComplete,
  onError
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { trackFeature, trackError } = useAnalytics();

  // Cleanup temporary images when component unmounts
  useEffect(() => {
    return () => {
      cleanupTemporaryImages().catch(console.error);
    };
  }, []);

  // Process image when URI changes
  useEffect(() => {
    if (imageUri) {
      processImage(imageUri).catch(error => {
        onError?.(error);
      });
    }
  }, [imageUri]);

  const processImage = async (uri: string) => {
    try {
      // Validate image first
      const isValid = await validateImage(uri);
      if (!isValid) {
        throw new ImageProcessingError(
          'Invalid or corrupted image file',
          'INVALID_IMAGE'
        );
      }

      // Compress and process image
      const processed = await compressImage(uri);
      setProcessedImage(processed);
      
      return processed;
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        throw error;
      }
      throw new ImageProcessingError(
        'Failed to process image',
        'PROCESSING_FAILED'
      );
    }
  };

  const handleAnalyze = async () => {
    if (!processedImage) return;

    setAnalyzing(true);
    const featureTracker = await trackFeature('plant_analysis', {
      image_size: `${processedImage.width}x${processedImage.height}`,
      file_size: processedImage.size,
      format: processedImage.format
    });

    try {
      // Simulate plant analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysisResult: AnalysisResult = {
        plantName: 'Monstera Deliciosa',
        confidence: 0.95,
        healthScore: 0.85,
        recommendations: [
          'Indirect bright light',
          'Water when top soil is dry',
          'High humidity preferred'
        ]
      };

      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);

      // Track successful analysis
      await featureTracker.complete('success');

    } catch (error) {
      // Track error
      await trackError(error as Error, {
        feature: 'plant_analysis',
        image_uri: processedImage.uri
      });

      await featureTracker.complete('error');
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetry = useCallback(() => {
    setResult(null);
    setProcessedImage(null);
    if (imageUri) {
      processImage(imageUri).catch(onError);
    }
  }, [imageUri]);

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please select an image to analyze</Text>
      </View>
    );
  }

  return (
    <ImageProcessingErrorBoundary onRetry={handleRetry} onError={onError}>
      <View style={styles.container}>
        {processedImage ? (
          <Image
            source={{ uri: processedImage.uri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}

        <TouchableOpacity
          style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={analyzing || !processedImage}
        >
          <Text style={styles.buttonText}>
            {analyzing ? 'Analyzing...' : 'Analyze Plant'}
          </Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.plantName}>{result.plantName}</Text>
            <Text>Confidence: {(result.confidence * 100).toFixed(1)}%</Text>
            <Text>Health Score: {(result.healthScore * 100).toFixed(1)}%</Text>
            
            <Text style={styles.recommendationsTitle}>Recommendations:</Text>
            {result.recommendations.map((rec, index) => (
              <Text key={index} style={styles.recommendation}>
                • {rec}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ImageProcessingErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666'
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16
  },
  analyzeButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 16
  },
  analyzeButtonDisabled: {
    backgroundColor: '#95a5a6'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  plantName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8
  },
  recommendation: {
    marginLeft: 8,
    marginBottom: 4
  }
}); 