import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AnalysisResult {
  plantName: string;
  confidence: number;
  description: string;
  careInstructions: string[];
  commonIssues: string[];
}

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

export function AnalysisResultCard({ result }: AnalysisResultCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.plantName}>{result.plantName}</Text>
      <Text style={styles.confidence}>
        {Math.round(result.confidence * 100)}% confident
      </Text>
      <Text style={styles.description}>{result.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
  },
  plantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  confidence: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
}); 