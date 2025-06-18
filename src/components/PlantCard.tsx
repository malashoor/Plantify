import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plant } from '../data/plants';

interface PlantCardProps {
  plant: Plant;
  onPress?: () => void;
}

export default function PlantCard({ plant, onPress }: PlantCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.name}>{plant.name}</Text>
        {plant.scientificName && <Text style={styles.scientificName}>{plant.scientificName}</Text>}
        {plant.description && <Text style={styles.description}>{plant.description}</Text>}
        <View style={styles.careInfo}>
          {plant.careLevel && <Text style={styles.careLevel}>Care: {plant.careLevel}</Text>}
          {plant.lightRequirement && (
            <Text style={styles.lightRequirement}>Light: {plant.lightRequirement}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#718096',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 8,
  },
  careInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  careLevel: {
    fontSize: 12,
    color: '#38a169',
    fontWeight: '500',
  },
  lightRequirement: {
    fontSize: 12,
    color: '#3182ce',
    fontWeight: '500',
  },
});
