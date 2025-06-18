import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { getPlantDetails, PlantDetails } from '../../lib/plant-identification';
import BackHeader from '@layouts/BackHeader';

export default function PlantCareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [plantDetails, setPlantDetails] = useState<PlantDetails | null>(null);

  useEffect(() => {
    async function loadPlantDetails() {
      try {
        const details = await getPlantDetails(id);
        setPlantDetails(details);
      } catch (error) {
        console.error('Error loading plant details:', error);
        Alert.alert('Error', 'Could not load plant care information. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadPlantDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <BackHeader title="Plant Care" />
        <View style={styles.centered}>
          <Text style={[styles.text, { color: theme.colors.text }]}>Loading plant care details...</Text>
        </View>
      </View>
    );
  }

  if (!plantDetails) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <BackHeader title="Plant Care" />
        <View style={styles.centered}>
          <Text style={[styles.text, { color: theme.colors.text }]}>No plant care information found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <BackHeader title={`${plantDetails.commonName} Care`} />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Plant Information</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>Scientific Name:</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>{plantDetails.scientificName}</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>Family:</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>{plantDetails.family}</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description:</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>{plantDetails.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Care Instructions</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>Watering:</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>{plantDetails.careInstructions.watering}</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>Sunlight:</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>{plantDetails.careInstructions.sunlight}</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>Soil:</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>{plantDetails.careInstructions.soil}</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>Temperature:</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>{plantDetails.careInstructions.temperature}</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>Humidity:</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>{plantDetails.careInstructions.humidity}</Text>
        </View>

        {plantDetails.diseases.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Common Issues</Text>
            {plantDetails.diseases.map((disease, index) => (
              <View key={index} style={styles.diseaseItem}>
                <Text style={[styles.label, { color: theme.colors.text }]}>{disease.name}</Text>
                <Text style={[styles.text, { color: theme.colors.text }]}>{disease.description}</Text>
                <Text style={[styles.label, { color: theme.colors.text }]}>Treatment:</Text>
                <Text style={[styles.text, { color: theme.colors.text }]}>{disease.treatment}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
  diseaseItem: {
    marginBottom: 16,
  },
}); 