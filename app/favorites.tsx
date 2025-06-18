import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useFavorites } from '../src/hooks/useFavorites';
import { PLANTS } from '../src/data/plants';
import PlantCard from '../src/components/PlantCard';

export default function Favorites() {
  const { favorites } = useFavorites();
  const favPlants = PLANTS.filter(p => favorites.includes(p.id));

  if (!favPlants.length) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20,
        backgroundColor: '#fff'
      }}>
        <Text style={{ 
          fontSize: 18, 
          color: '#666', 
          textAlign: 'center',
          lineHeight: 24 
        }}>
          No favorites yet—tap the heart on a plant to bookmark it!
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={favPlants}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PlantCard plant={item} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
} 