import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Surface, Text, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Plant } from '../../types/plant';

interface PlantCardProps {
  plant: Plant;
  onPress: () => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ plant, onPress }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getEnvironmentIcon = () => {
    if (plant.growingMethodType === 'hydroponic') {
      return 'flask';
    }
    return plant.environment === 'indoor' ? 'home' : 'tree';
  };

  const getEnvironmentLabel = () => {
    const baseLabel = t(`environment.${plant.environment}.${plant.growingMethodType}`);
    return baseLabel;
  };

  const getMoistureStatusColor = () => {
    if (plant.moistureData.length === 0) return theme.colors.surfaceVariant;
    
    const latestMoisture = plant.moistureData[plant.moistureData.length - 1].moisture;
    if (latestMoisture < plant.speciesProfile.moisture.moistureThresholds.min) {
      return theme.colors.error;
    }
    if (latestMoisture < plant.speciesProfile.moisture.moistureThresholds.optimal) {
      return theme.colors.warning;
    }
    return theme.colors.primary;
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('plantCard.accessibility.card', {
        name: plant.name,
        environment: getEnvironmentLabel(),
      })}
    >
      <Surface style={styles.card} elevation={1}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            {plant.name}
          </Text>
          <MaterialCommunityIcons
            name="water"
            size={24}
            color={getMoistureStatusColor()}
          />
        </View>

        <Text variant="bodyMedium" style={styles.species}>
          {plant.speciesProfile.name}
        </Text>

        <View style={styles.footer}>
          <Chip
            icon={getEnvironmentIcon()}
            compact
            mode="outlined"
            style={styles.environmentChip}
          >
            {getEnvironmentLabel()}
          </Chip>

          {plant.nextWatering && (
            <Text variant="bodySmall" style={styles.nextWatering}>
              {t('plantCard.nextWatering', {
                date: format(plant.nextWatering, 'MMM d'),
              })}
            </Text>
          )}
        </View>
      </Surface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  species: {
    opacity: 0.7,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  environmentChip: {
    height: 28,
  },
  nextWatering: {
    opacity: 0.7,
  },
}); 