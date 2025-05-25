import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PLANTS_MAP } from '@/data/plants';

export default function PlantDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const plant = PLANTS_MAP[params.id];
  if (!plant) return <Text>Plant not found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={plant.image} style={styles.image} />
      <Text style={styles.name}>{plant.name}</Text>
      <Text style={styles.description}>{plant.description}</Text>
      <Text style={styles.sectionTitle}>Care Instructions</Text>
      <Text style={styles.care}>{plant.care}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', alignItems: 'center' },
  image: { width: 200, height: 200, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  care: { fontSize: 16, color: '#333', textAlign: 'center' },
}); 