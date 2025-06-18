import React, { useEffect } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  AccessibilityInfo,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { PlantCard } from './PlantCard';
import { Plant } from '../../types/plant';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface AnimatedPlantListProps {
  plants: Plant[];
  onPlantPress: (id: string) => void;
  emptyStateText: string;
  sortKey: string; // Used to trigger animations on sort changes
}

export const AnimatedPlantList: React.FC<AnimatedPlantListProps> = ({
  plants,
  onPlantPress,
  emptyStateText,
  sortKey,
}) => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        300, // duration
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
  }, [sortKey, prefersReducedMotion]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="titleMedium">{emptyStateText}</Text>
    </View>
  );

  return (
    <FlatList
      data={plants}
      renderItem={({ item }) => <PlantCard plant={item} onPress={() => onPlantPress(item.id)} />}
      keyExtractor={item => `${item.id}-${sortKey}`}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={renderEmptyState}
      removeClippedSubviews={false} // Important for smooth animations
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      // Improve animation performance
      getItemLayout={(data, index) => ({
        length: 120, // Approximate height of a PlantCard
        offset: 120 * index + (index > 0 ? 16 * index : 0), // Account for gap
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
});
