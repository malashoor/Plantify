import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const PLANTS = {
  '1': {
    id: '1',
    name: 'Aloe Vera',
    image: require('@assets/plants/aloe_vera.png'),
    description: 'A succulent plant species known for its medicinal properties.',
    care: 'Water sparingly—allow soil to dry between waterings. Prefers bright, indirect light.',
  },
  '2': {
    id: '2',
    name: 'Basil',
    image: require('@assets/plants/basil.png'),
    description: 'A fragrant culinary herb used in many dishes.',
    care: 'Keep soil moist but not waterlogged. Needs at least 6 hours of sunlight daily.',
  },
  '3': {
    id: '3',
    name: 'Fern',
    image: require('@assets/plants/fern.png'),
    description: 'Lush green plants that thrive in humid environments.',
    care: 'Keep soil consistently moist. Prefers indirect light and high humidity.',
  },
  '4': {
    id: '4',
    name: 'Snake Plant',
    image: require('@assets/plants/snake_plant.png'),
    description: 'A hardy plant known for purifying air and tolerating neglect.',
    care: 'Water every 2-3 weeks. Thrives in low light conditions.',
  },
};

export default function PlantDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const plant = PLANTS[params.id];
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
