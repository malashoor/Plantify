import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import { PLANTS } from '@data/plants';
import PlantCard from '@components/PlantCard';

export default function Plants() {
  const [query, setQuery] = useState('');
  const filteredPlants = PLANTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search plants…"
        style={styles.search}
      />
      <FlatList
        data={filteredPlants}
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
  search: { padding: 8, margin: 16, borderRadius: 8, backgroundColor: '#f0f0f0' },
});
