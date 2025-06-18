import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PLANTS } from '@data/plants';
import BackHeader from '@layouts/BackHeader';

// Import placeholder image
const placeholderPlantImage = require('../../../assets/images/placeholder-seed.png');

export default function PlantDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const plant = PLANTS.find(p => p.id === params.id);

  if (!plant) return <Text>Plant not found.</Text>;

  const handlePlantCare = () => {
    try {
      console.log('🌱 Navigating to Plant Care');
      router.push(`/plant-care/${params.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not open Plant Care screen. Please try again.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <BackHeader title={plant.name} />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={plant.image || placeholderPlantImage} style={styles.image} />
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.description}>{plant.description}</Text>

        <Text style={styles.sectionTitle}>Care Instructions</Text>
        <Text style={styles.care}>{plant.care}</Text>

        {/* Plant Care Button */}
        <TouchableOpacity style={styles.careButton} onPress={handlePlantCare} activeOpacity={0.8}>
          <Ionicons name="leaf" size={20} color="white" />
          <Text style={styles.careButtonText}>View Plant Care Guide</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, backgroundColor: '#fff', alignItems: 'center' },
  image: { width: 200, height: 200, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  care: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 24 },
  careButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  careButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
