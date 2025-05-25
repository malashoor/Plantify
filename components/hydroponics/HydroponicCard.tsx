import { Card, Text, useTheme } from '@rneui/themed';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';


import { useToast } from '@/hooks/useToast';
import { HydroponicSystem } from '@/types/hydroponic';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

interface HydroponicCardProps {
  system: HydroponicSystem;
  onPress: () => void;
}

export function HydroponicCard({ system, onPress }: HydroponicCardProps) {
  const { theme } = useTheme();
  const { showError } = useToast();

  const handlePress = () => {
    try {
      onPress();
    } catch (error) {
      showError('Failed to open system details');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${system.name} details`}
      accessibilityHint="Open the hydroponic system details screen"
    >
      <Card containerStyle={styles.card}>
        <Card.Title>{system.name}</Card.Title>
        <Card.Divider />
        <View style={styles.content}>
          <Text>Type: {system.type}</Text>
          <Text>Status: {system.is_active ? 'Active' : 'Inactive'}</Text>
          {system.notes && <Text>Notes: {system.notes}</Text>}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginBottom: 16,
  },
  content: {
    gap: 8,
  },
});
