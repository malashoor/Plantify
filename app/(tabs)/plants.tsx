import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const PLANTS = [
  { id: '1', name: 'Aloe Vera' },
  { id: '2', name: 'Basil' },
  { id: '3', name: 'Fern' },
  { id: '4', name: 'Snake Plant' },
];

export default function Plants() {
  return (
    <View style={styles.container}>
      <FlatList
        data={PLANTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  card: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  name: {
    fontSize: 18,
  },
}); 