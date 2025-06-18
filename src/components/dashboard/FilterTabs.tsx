import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type FilterType = 'all' | 'indoor' | 'outdoor' | 'hydroponic';

interface FilterTabsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: Record<FilterType, number>;
  isRTL?: boolean;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  isRTL = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getFilterIcon = useCallback((filter: FilterType): string => {
    switch (filter) {
      case 'indoor':
        return 'home';
      case 'outdoor':
        return 'tree';
      case 'hydroponic':
        return 'flask';
      default:
        return 'apps';
    }
  }, []);

  const filters: FilterType[] = ['all', 'indoor', 'outdoor', 'hydroponic'];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isRTL && styles.scrollContentRTL]}
      >
        {filters.map(filter => (
          <Chip
            key={filter}
            selected={currentFilter === filter}
            onPress={() => onFilterChange(filter)}
            style={[
              styles.chip,
              currentFilter === filter && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name={getFilterIcon(filter)} size={size} color={color} />
            )}
            accessibilityRole="tab"
            accessibilityState={{ selected: currentFilter === filter }}
            accessibilityLabel={t('filters.accessibility.tab', {
              filter: t(`filters.${filter}`),
              count: counts[filter],
            })}
          >
            {t(`filters.${filter}`)} ({counts[filter]})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  scrollContentRTL: {
    flexDirection: 'row-reverse',
  },
  chip: {
    height: 36,
  },
});
