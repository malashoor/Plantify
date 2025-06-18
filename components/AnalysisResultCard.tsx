import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface AnalysisResult {
  condition: string;
  confidence: number;
  scientificName?: string;
  commonName?: string;
  recommendations: string[];
}

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

export const AnalysisResultCard = ({ result }: AnalysisResultCardProps): React.ReactElement => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#f44336';
  };

  const confidenceColor = getConfidenceColor(result.confidence);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{result.condition}</Text>
      </View>

      {result.scientificName && <Text style={styles.scientificName}>{result.scientificName}</Text>}

      {result.commonName && <Text style={styles.commonName}>Common Name: {result.commonName}</Text>}

      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Confidence:</Text>
        <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
          {Math.round(result.confidence * 100)}%
        </Text>
      </View>

      {result.recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommendations:</Text>
          {result.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 4,
  },
  commonName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
});
