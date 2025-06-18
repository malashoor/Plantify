import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useFavorites } from '../hooks/useFavorites';

// Import placeholder image
const placeholderPlantImage = require('../assets/images/placeholder-seed.png');

type Plant = {
  id: string;
  name: string;
  image: any;
  description: string;
  care: string;
};

type PlantCardProps = {
  plant: Plant;
};

export default function PlantCard({ plant }: PlantCardProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFav = favorites.includes(plant.id);

  return (
    <View style={styles.card}>
      <Link href={`/plants/${plant.id}`} asChild>
        <Pressable style={styles.cardContent}>
          <Image
            source={plant.image || placeholderPlantImage}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.info}>
            <Text style={styles.name}>{plant.name}</Text>
            <Text style={styles.description}>{plant.description}</Text>
            <Text style={styles.careLabel}>Care:</Text>
            <Text style={styles.care}>{plant.care}</Text>
          </View>
        </Pressable>
      </Link>
      <Pressable style={styles.favoriteButton} onPress={() => toggleFavorite(plant.id)}>
        <MaterialIcons
          name={isFav ? 'favorite' : 'favorite-border'}
          size={24}
          color={isFav ? 'red' : '#888'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  description: { marginTop: 4, fontSize: 14, color: '#555' },
  careLabel: { marginTop: 8, fontSize: 12, fontWeight: '600' },
  care: { fontSize: 12, color: '#333' },
  favoriteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});
