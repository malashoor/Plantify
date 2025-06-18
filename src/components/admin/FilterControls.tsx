import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FilterControlsProps {
  onFilterChange?: (filter: string) => void;
  selectedFilter?: string;
}

export function FilterControls({ onFilterChange, selectedFilter = 'all' }: FilterControlsProps) {
  const filters = [
    { id: 'all', label: 'All Time' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Period</Text>
      <View style={styles.filterRow}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterButton, selectedFilter === filter.id && styles.filterButtonActive]}
            onPress={() => onFilterChange?.(filter.id)}
          >
            <Text
              style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
});
