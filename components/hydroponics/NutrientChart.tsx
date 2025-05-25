import { Text, useTheme } from '@rneui/themed';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

import { ChartDataset } from '@/types';
import { SystemMeasurement } from '@/types/hydroponic';
import { InteractiveChartWithDateRange } from '@/components/charts/InteractiveChartWithDateRange';

interface NutrientChartProps {
  measurements: SystemMeasurement[];
  type?: 'nutrients' | 'ph' | 'ec' | 'temperature';
  title?: string;
}

export function NutrientChart({ 
  measurements, 
  type = 'nutrients',
  title = 'Nutrient Levels'
}: NutrientChartProps) {
  const { theme } = useTheme();

  // Map function to transform measurements to datasets
  const mapMeasurementsToDatasets = useCallback((_, __): ChartDataset[] => {
    const sortedMeasurements = [...measurements].sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );

    switch (type) {
      case 'nutrients':
        return [
          {
            label: 'Nitrogen',
            data: sortedMeasurements.map(m => ({
              timestamp: new Date(m.measured_at),
              value: m.nitrogen_level,
              label: new Date(m.measured_at).toLocaleDateString(),
            })),
            color: theme.colors.primary,
          },
          {
            label: 'Phosphorus',
            data: sortedMeasurements.map(m => ({
              timestamp: new Date(m.measured_at),
              value: m.phosphorus_level,
              label: new Date(m.measured_at).toLocaleDateString(),
            })),
            color: theme.colors.warning,
          },
          {
            label: 'Potassium',
            data: sortedMeasurements.map(m => ({
              timestamp: new Date(m.measured_at),
              value: m.potassium_level,
              label: new Date(m.measured_at).toLocaleDateString(),
            })),
            color: theme.colors.error,
          },
        ];
      case 'ph':
        return [{
          label: 'pH',
          data: sortedMeasurements.map(m => ({
            timestamp: new Date(m.measured_at),
            value: m.ph_level,
            label: new Date(m.measured_at).toLocaleDateString(),
          })),
          color: theme.colors.primary,
        }];
      case 'ec':
        return [{
          label: 'EC',
          data: sortedMeasurements.map(m => ({
            timestamp: new Date(m.measured_at),
            value: m.ec_level,
            label: new Date(m.measured_at).toLocaleDateString(),
          })),
          color: theme.colors.warning,
        }];
      case 'temperature':
        return [{
          label: 'Temperature',
          data: sortedMeasurements.map(m => ({
            timestamp: new Date(m.measured_at),
            value: m.water_temperature,
            label: new Date(m.measured_at).toLocaleDateString(),
          })),
          color: theme.colors.error,
        }];
      default:
        return [];
    }
  }, [measurements, type, theme.colors]);

  // Get the unit for the current type
  const getUnit = useCallback((): string => {
    switch (type) {
      case 'ph':
        return '';
      case 'ec':
        return 'mS/cm';
      case 'temperature':
        return '°C';
      case 'nutrients':
        return 'ppm';
      default:
        return '';
    }
  }, [type]);

  if (measurements.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No measurements available for chart</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InteractiveChartWithDateRange
        data={[measurements]} // Wrap in array since our hook expects an array
        mapFunction={mapMeasurementsToDatasets}
        title={title}
        unit={getUnit()}
        useVictory={true}
        bezier={true}
        testID={`${type}-chart`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
});
