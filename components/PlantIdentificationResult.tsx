import {
  Droplet,
  Sun,
  Thermometer,
  Wind,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import React from 'react';

import type { PlantIdentification } from '@/utils/ai';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';


interface Props {
  result: PlantIdentification;
  onAddToGarden?: () => void;
}

export default function PlantIdentificationResult({
  result,
  onAddToGarden,
}: Props) {
  const getCareIcon = (type: string) => {
    switch (type) {
      case 'watering':
        return <Droplet size={20} color="#2E7D32" />;
      case 'sunlight':
        return <Sun size={20} color="#2E7D32" />;
      case 'temperature':
        return <Thermometer size={20} color="#2E7D32" />;
      case 'humidity':
        return <Wind size={20} color="#2E7D32" />;
      default:
        return <Droplet size={20} color="#2E7D32" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.confidence}>
          {Math.round(result.confidence * 100)}% Match
        </Text>
        <Text style={styles.scientificName}>{result.scientificName}</Text>
        <Text style={styles.commonName}>{result.commonName}</Text>
        <Text style={styles.family}>Family: {result.family}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Care Instructions</Text>
        <View style={styles.careGrid}>
          <View style={styles.careItem}>
            {getCareIcon('watering')}
            <View style={styles.careTextContainer}>
              <Text style={styles.careLabel}>Watering</Text>
              <Text style={styles.careText}>
                {result.careInstructions.watering}
              </Text>
            </View>
          </View>

          <View style={styles.careItem}>
            {getCareIcon('sunlight')}
            <View style={styles.careTextContainer}>
              <Text style={styles.careLabel}>Sunlight</Text>
              <Text style={styles.careText}>
                {result.careInstructions.sunlight}
              </Text>
            </View>
          </View>

          <View style={styles.careItem}>
            {getCareIcon('temperature')}
            <View style={styles.careTextContainer}>
              <Text style={styles.careLabel}>Temperature</Text>
              <Text style={styles.careText}>
                {result.careInstructions.temperature}
              </Text>
            </View>
          </View>

          <View style={styles.careItem}>
            {getCareIcon('humidity')}
            <View style={styles.careTextContainer}>
              <Text style={styles.careLabel}>Humidity</Text>
              <Text style={styles.careText}>
                {result.careInstructions.humidity}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {result.diseases.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Potential Issues</Text>
          {result.diseases.map((disease, index) => (
            <View key={index} style={styles.diseaseCard}>
              <View style={styles.diseaseHeader}>
                <AlertCircle size={20} color="#E53935" />
                <Text style={styles.diseaseName}>{disease.name}</Text>
                <Text style={styles.diseaseProbability}>
                  {Math.round(disease.probability * 100)}%
                </Text>
              </View>
              <Text style={styles.diseaseDescription}>
                {disease.description}
              </Text>
              <View style={styles.treatmentContainer}>
                <Text style={styles.treatmentLabel}>Treatment:</Text>
                <Text style={styles.treatmentText}>{disease.treatment}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {onAddToGarden && (
        <TouchableOpacity style={styles.addButton} onPress={onAddToGarden}>
          <Text style={styles.addButtonText}>Add to My Garden</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    margin: 16,
  },
  confidence: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  scientificName: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  commonName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  family: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginBottom: 16,
  },
  careGrid: {
    gap: 16,
  },
  careItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  careTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  careLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  careText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    lineHeight: 20,
  },
  diseaseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  diseaseName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  diseaseProbability: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#E53935',
  },
  diseaseDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  treatmentContainer: {
    backgroundColor: '#FBE9E7',
    padding: 12,
    borderRadius: 8,
  },
  treatmentLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#D32F2F',
    marginBottom: 4,
  },
  treatmentText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#D32F2F',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#2E7D32',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
