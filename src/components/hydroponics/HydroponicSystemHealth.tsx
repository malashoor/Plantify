import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HydroponicSystemData {
  ph: number;
  nutrients: number;
  temperature: number;
  lightHours: number;
  status: 'active' | 'inactive' | 'maintenance';
}

interface HydroponicSystemHealthProps {
  system: HydroponicSystemData;
}

export function HydroponicSystemHealth({ system }: HydroponicSystemHealthProps) {
  const getHealthStatus = () => {
    const issues = [];

    if (system.ph < 5.5 || system.ph > 6.5) {
      issues.push('pH out of range');
    }

    if (system.nutrients < 800 || system.nutrients > 1500) {
      issues.push('Nutrient levels need adjustment');
    }

    if (system.temperature < 18 || system.temperature > 28) {
      issues.push('Temperature not optimal');
    }

    return issues.length === 0 ? 'Healthy' : issues.join(', ');
  };

  const getStatusColor = () => {
    const health = getHealthStatus();
    if (health === 'Healthy') return '#4CAF50';
    return '#FF9800';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Health</Text>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>pH Level</Text>
          <Text style={styles.metricValue}>{system.ph.toFixed(1)}</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Nutrients</Text>
          <Text style={styles.metricValue}>{system.nutrients} ppm</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Temperature</Text>
          <Text style={styles.metricValue}>{system.temperature}°C</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Light Hours</Text>
          <Text style={styles.metricValue}>{system.lightHours}h</Text>
        </View>
      </View>

      <View style={[styles.statusContainer, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getHealthStatus()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    width: '48%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
