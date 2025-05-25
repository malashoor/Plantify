import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text, Button, useTheme } from '@rneui/themed';
import { format } from 'date-fns';
import React from 'react';

import { View, StyleSheet } from 'react-native';

import type { Measurement } from '../hooks/useHydroponics';

interface MeasurementCardProps {
  measurement: Measurement;
  onDelete?: (measurementId: string) => void;
}

export function MeasurementCard({ measurement, onDelete }: MeasurementCardProps) {
  const { theme } = useTheme();

  return (
    <Card
      containerStyle={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.grey5,
        },
      ]}
    >
      <View style={styles.header}>
        <Text
          h4
          accessibilityRole="header"
          accessibilityLabel={`Measurement from ${format(measurement.timestamp, 'PPp')}`}
        >
          {format(measurement.timestamp, 'PPp')}
        </Text>
        {onDelete && (
          <Button
            type="clear"
            onPress={() => onDelete(measurement.id)}
            accessibilityLabel="Delete measurement"
            accessibilityHint="Deletes this measurement record permanently"
            icon={
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color={theme.colors.error}
              />
            }
          />
        )}
      </View>

      <View style={styles.measurements} accessibilityRole="list">
        <View
          style={styles.measurement}
          accessibilityRole="listitem"
          accessibilityLabel={`pH level ${measurement.ph}`}
        >
          <MaterialCommunityIcons
            name="water"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.label}>pH</Text>
          <Text h4>{measurement.ph.toFixed(1)}</Text>
        </View>

        <View
          style={styles.measurement}
          accessibilityRole="listitem"
          accessibilityLabel={`EC ${measurement.ec} millisiemens per centimeter`}
        >
          <MaterialCommunityIcons
            name="flash"
            size={24}
            color={theme.colors.warning}
          />
          <Text style={styles.label}>EC</Text>
          <Text h4>{measurement.ec.toFixed(2)} mS/cm</Text>
        </View>

        <View
          style={styles.measurement}
          accessibilityRole="listitem"
          accessibilityLabel={`Temperature ${measurement.temperature} degrees Celsius`}
        >
          <MaterialCommunityIcons
            name="thermometer"
            size={24}
            color={theme.colors.error}
          />
          <Text style={styles.label}>Temperature</Text>
          <Text h4>{measurement.temperature.toFixed(1)}°C</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  measurements: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  measurement: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '500',
  },
}); 