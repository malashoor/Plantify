import {
  Droplet,
  Thermometer,
  Activity,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';

import { getHydroponicData, type HydroponicData } from '@/utils/ai';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';


interface Props {
  systemId: string;
  refreshInterval?: number;
}

export default function HydroponicMonitor({
  systemId,
  refreshInterval = 60000,
}: Props) {
  const [data, setData] = useState<HydroponicData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newData = await getHydroponicData(systemId);
        setData(newData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch hydroponic data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [systemId, refreshInterval]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={24} color="#E53935" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Activity size={24} color="#2E7D32" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  const getStatusColor = (value: number, type: string) => {
    switch (type) {
      case 'ph':
        return value >= 5.5 && value <= 6.5 ? '#4CAF50' : '#F44336';
      case 'ec':
        return value >= 1.2 && value <= 2.4 ? '#4CAF50' : '#F44336';
      case 'temperature':
        return value >= 20 && value <= 25 ? '#4CAF50' : '#F44336';
      default:
        return '#4CAF50';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mainMetrics}>
        <View style={styles.metricCard}>
          <Droplet size={24} color={getStatusColor(data.ph, 'ph')} />
          <Text style={styles.metricValue}>{data.ph.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>pH Level</Text>
        </View>

        <View style={styles.metricCard}>
          <Activity size={24} color={getStatusColor(data.ec, 'ec')} />
          <Text style={styles.metricValue}>{data.ec.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>EC (mS/cm)</Text>
        </View>

        <View style={styles.metricCard}>
          <Thermometer
            size={24}
            color={getStatusColor(data.temperature, 'temperature')}
          />
          <Text style={styles.metricValue}>
            {data.temperature.toFixed(1)}°C
          </Text>
          <Text style={styles.metricLabel}>Temperature</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrient Levels (ppm)</Text>
        <View style={styles.nutrientGrid}>
          {Object.entries(data.nutrientLevels).map(([nutrient, level]) => (
            <View key={nutrient} style={styles.nutrientCard}>
              <Text style={styles.nutrientName}>
                {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
              </Text>
              <Text style={styles.nutrientValue}>{level}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dissolved Oxygen</Text>
        <View style={styles.doCard}>
          <Text style={styles.doValue}>
            {data.dissolvedOxygen.toFixed(1)} mg/L
          </Text>
          <Text style={styles.doStatus}>
            {data.dissolvedOxygen >= 6 ? 'Optimal' : 'Low'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#E53935',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#666666',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginTop: 8,
  },
  mainMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  metricValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginBottom: 12,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutrientCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  nutrientName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666666',
  },
  nutrientValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginTop: 4,
  },
  doCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  doValue: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
  },
  doStatus: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4CAF50',
    marginTop: 4,
  },
});
