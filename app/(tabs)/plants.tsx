import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

const PLANTS = [
  {
    id: '1',
    name: 'Aloe Vera',
    image: require('@/assets/plants/aloe_vera.png'),
    description: 'A succulent plant species known for its medicinal properties.',
    care: 'Water sparingly—allow soil to dry between waterings. Prefers bright, indirect light.',
  },
  {
    id: '2',
    name: 'Basil',
    image: require('@/assets/plants/basil.png'),
    description: 'A fragrant culinary herb used in many dishes.',
    care: 'Keep soil moist but not waterlogged. Needs at least 6 hours of sunlight daily.',
  },
  {
    id: '3',
    name: 'Fern',
    image: require('@/assets/plants/fern.png'),
    description: 'Lush green plants that thrive in humid environments.',
    care: 'Keep soil consistently moist. Prefers indirect light and high humidity.',
  },
  {
    id: '4',
    name: 'Snake Plant',
    image: require('@/assets/plants/snake_plant.png'),
    description: 'A hardy plant known for purifying air and tolerating neglect.',
    care: 'Water every 2-3 weeks. Thrives in low light conditions.',
  },
];

export default function Plants() {
  return (
    <View style={styles.container}>
      <FlatList
        data={PLANTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} resizeMode="cover" />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.careLabel}>Care:</Text>
              <Text style={styles.care}>{item.care}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  card: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  description: { marginTop: 4, fontSize: 14, color: '#555' },
  careLabel: { marginTop: 8, fontSize: 12, fontWeight: '600' },
  care: { fontSize: 12, color: '#333' },
}); 