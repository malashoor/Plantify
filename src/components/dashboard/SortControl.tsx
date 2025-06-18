import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, IconButton, useTheme, Divider, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export type SortCriteria = 'nextWatering' | 'moisture' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  primary: {
    criteria: SortCriteria;
    direction: SortDirection;
  };
  secondary: {
    criteria: SortCriteria;
    direction: SortDirection;
  } | null;
}

interface SortControlProps {
  currentSort: SortConfig;
  onSortChange: (config: SortConfig) => void;
  isRTL?: boolean;
}

export const SortControl: React.FC<SortControlProps> = ({
  currentSort,
  onSortChange,
  isRTL = false,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const getSortIcon = (criteria: SortCriteria): string => {
    switch (criteria) {
      case 'nextWatering':
        return 'calendar-clock';
      case 'moisture':
        return 'water';
      case 'name':
        return 'sort-alphabetical-ascending';
      default:
        return 'sort';
    }
  };

  const getDirectionIcon = (direction: SortDirection): string => {
    return direction === 'asc' ? 'arrow-up' : 'arrow-down';
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handlePrimarySortChange = (criteria: SortCriteria) => {
    // If selecting the current secondary as primary, swap them
    if (currentSort.secondary?.criteria === criteria) {
      onSortChange({
        primary: {
          criteria,
          direction: currentSort.secondary.direction,
        },
        secondary: {
          criteria: currentSort.primary.criteria,
          direction: currentSort.primary.direction,
        },
      });
    } else {
      onSortChange({
        ...currentSort,
        primary: {
          ...currentSort.primary,
          criteria,
        },
      });
    }
    closeMenu();
  };

  const handleSecondarySortChange = (criteria: SortCriteria) => {
    // Don't allow same criteria for both primary and secondary
    if (criteria === currentSort.primary.criteria) {
      onSortChange({
        ...currentSort,
        secondary: null,
      });
    } else {
      onSortChange({
        ...currentSort,
        secondary: {
          criteria,
          direction: 'asc', // Default to ascending for new secondary sort
        },
      });
    }
    closeMenu();
  };

  const toggleDirection = (isPrimary: boolean) => {
    if (isPrimary) {
      onSortChange({
        ...currentSort,
        primary: {
          ...currentSort.primary,
          direction: currentSort.primary.direction === 'asc' ? 'desc' : 'asc',
        },
      });
    } else if (currentSort.secondary) {
      onSortChange({
        ...currentSort,
        secondary: {
          ...currentSort.secondary,
          direction: currentSort.secondary.direction === 'asc' ? 'desc' : 'asc',
        },
      });
    }
  };

  const renderSortItem = (
    criteria: SortCriteria,
    isPrimary: boolean = true
  ) => {
    const isSelected = isPrimary
      ? currentSort.primary.criteria === criteria
      : currentSort.secondary?.criteria === criteria;
    const isDisabled = !isPrimary && currentSort.primary.criteria === criteria;
    const direction = isPrimary
      ? currentSort.primary.direction
      : currentSort.secondary?.direction ?? 'asc';

    return (
      <View style={styles.menuItemContainer}>
        <Menu.Item
          leadingIcon={({ size, color }) => (
            <MaterialCommunityIcons
              name={getSortIcon(criteria)}
              size={size}
              color={isDisabled ? theme.colors.surfaceDisabled : color}
            />
          )}
          onPress={() =>
            isPrimary
              ? handlePrimarySortChange(criteria)
              : handleSecondarySortChange(criteria)
          }
          title={t(`sorting.criteria.${criteria}`)}
          disabled={isDisabled}
          accessibilityState={{
            selected: isSelected,
            disabled: isDisabled,
          }}
          accessibilityHint={
            isPrimary
              ? t('sorting.accessibility.primaryHint')
              : t('sorting.accessibility.secondaryHint')
          }
        />
        {isSelected && !isDisabled && (
          <IconButton
            icon={getDirectionIcon(direction)}
            size={20}
            onPress={() => toggleDirection(isPrimary)}
            accessibilityLabel={t('sorting.accessibility.toggleDirection', {
              direction: t(`sorting.direction.${direction}`),
            })}
          />
        )}
      </View>
    );
  };

  const getSortDescription = () => {
    const primary = t(`sorting.criteria.${currentSort.primary.criteria}`);
    const primaryDir = t(`sorting.direction.${currentSort.primary.direction}`);
    if (!currentSort.secondary) {
      return t('sorting.descriptionSingle', { criteria: primary, direction: primaryDir });
    }
    const secondary = t(`sorting.criteria.${currentSort.secondary.criteria}`);
    const secondaryDir = t(`sorting.direction.${currentSort.secondary.direction}`);
    return t('sorting.descriptionCombined', {
      primary,
      primaryDir,
      secondary,
      secondaryDir,
    });
  };

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            icon={({ size, color }) => (
              <MaterialCommunityIcons
                name={getSortIcon(currentSort.primary.criteria)}
                size={size}
                color={color}
              />
            )}
            size={24}
            onPress={openMenu}
            accessibilityLabel={t('sorting.accessibility.button', {
              current: getSortDescription(),
            })}
            accessibilityHint={t('sorting.accessibility.buttonHint')}
          />
        }
      >
        <View style={styles.menuSection}>
          <Text variant="labelSmall" style={styles.menuLabel}>
            {t('sorting.primaryLabel')}
          </Text>
          {['nextWatering', 'moisture', 'name'].map((criteria) =>
            renderSortItem(criteria as SortCriteria, true)
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.menuSection}>
          <Text variant="labelSmall" style={styles.menuLabel}>
            {t('sorting.secondaryLabel')}
          </Text>
          {['nextWatering', 'moisture', 'name'].map((criteria) =>
            renderSortItem(criteria as SortCriteria, false)
          )}
        </View>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
  },
  containerRTL: {
    alignSelf: 'flex-start',
  },
  menuSection: {
    padding: 8,
  },
  menuLabel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 4,
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}); 