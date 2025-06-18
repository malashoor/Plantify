import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFavorites } from '../../hooks/useFavorites';
import { PLANTS } from '../../src/data/plants';
import PlantCard from '../../src/components/PlantCard';

export default function Favorites() {
  const { favorites } = useFavorites();
  const favPlants = PLANTS.filter(p => favorites.includes(p.id));

  if (!favPlants.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorites yet—tap the heart on a plant to bookmark it!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favPlants}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PlantCard plant={item} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContainer: { padding: 16 },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center',
    lineHeight: 24 
  },
}); 