import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Icon, Divider, Button } from '@rneui/themed';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { HydroponicSystemWithDetails, SystemMeasurement } from '@/types/hydroponic';
import { useTheme } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { InteractiveChartWithDateRange } from '@/components/charts/InteractiveChartWithDateRange';
import { ChartDataset } from '@/types';

interface HydroponicSystemHealthProps {
  system: HydroponicSystemWithDetails;
  onAddMeasurement: () => void;
  onCreateReminder: () => void;
}

export const HydroponicSystemHealth: React.FC<HydroponicSystemHealthProps> = ({
  system,
  onAddMeasurement,
  onCreateReminder,
}) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width - 40;

  // Sort measurements by date, most recent first
  const sortedMeasurements = useMemo(() => {
    return [...system.measurements].sort(
      (a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
    );
  }, [system.measurements]);

  // Get latest measurement
  const latestMeasurement = useMemo(() => {
    return sortedMeasurements.length > 0 ? sortedMeasurements[0] : null;
  }, [sortedMeasurements]);

  // Function to map measurements to chart datasets
  const mapPhToDataset = useCallback((data, _) => {
    return [{
      label: 'pH',
      data: data.map(m => ({
        timestamp: new Date(m.measured_at),
        value: m.ph_level,
        label: new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })),
      color: theme.colors.primary,
    }];
  }, [theme.colors.primary]);

  const mapEcToDataset = useCallback((data, _) => {
    return [{
      label: 'EC',
      data: data.map(m => ({
        timestamp: new Date(m.measured_at),
        value: m.ec_level,
        label: new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })),
      color: theme.colors.secondary,
    }];
  }, [theme.colors.secondary]);

  const mapTempToDataset = useCallback((data, _) => {
    return [{
      label: 'Temperature',
      data: data.map(m => ({
        timestamp: new Date(m.measured_at),
        value: m.water_temperature,
        label: new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })),
      color: '#FF6B6B',
    }];
  }, []);

  // Function to determine health status based on measurements
  const getSystemHealthStatus = (measurement: SystemMeasurement | null) => {
    if (!measurement) return { status: 'unknown', color: theme.colors.grey3, message: 'No data available' };

    // Define optimal ranges
    const pH_MIN = 5.5;
    const pH_MAX = 7.0;
    const EC_MIN = 0.8;
    const EC_MAX = 2.0;
    const TEMP_MIN = 18;
    const TEMP_MAX = 26;

    // Check if any parameters are outside optimal range
    const phOutOfRange = measurement.ph_level < pH_MIN || measurement.ph_level > pH_MAX;
    const ecOutOfRange = measurement.ec_level < EC_MIN || measurement.ec_level > EC_MAX;
    const tempOutOfRange = measurement.water_temperature < TEMP_MIN || measurement.water_temperature > TEMP_MAX;

    // Count issues
    const issueCount = [phOutOfRange, ecOutOfRange, tempOutOfRange].filter(Boolean).length;

    if (issueCount === 0) {
      return { 
        status: 'excellent', 
        color: '#4CAF50', 
        message: 'All parameters within optimal range' 
      };
    } else if (issueCount === 1) {
      return { 
        status: 'good', 
        color: '#8BC34A', 
        message: 'Minor adjustment needed' 
      };
    } else if (issueCount === 2) {
      return { 
        status: 'warning', 
        color: '#FFC107', 
        message: 'Multiple parameters need attention' 
      };
    } else {
      return { 
        status: 'critical', 
        color: '#F44336', 
        message: 'System needs immediate attention' 
      };
    }
  };

  const healthStatus = getSystemHealthStatus(latestMeasurement);

  // Determine if we have enough data for charts
  const hasChartData = sortedMeasurements.length >= 2;

  const chartConfig = {
    backgroundGradientFrom: theme.mode === 'dark' ? '#2c2c2c' : '#ffffff',
    backgroundGradientTo: theme.mode === 'dark' ? '#3a3a3a' : '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => theme.mode === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => theme.mode === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
    },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* System Health Status Card */}
      <Card containerStyle={styles.card}>
        <Card.Title>System Health Status</Card.Title>
        <Card.Divider />
        <View style={styles.healthStatusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: healthStatus.color }]} />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>{healthStatus.status.toUpperCase()}</Text>
            <Text style={styles.statusMessage}>{healthStatus.message}</Text>
          </View>
        </View>
      </Card>

      {/* Current Readings Card */}
      <Card containerStyle={styles.card}>
        <Card.Title>Current Readings</Card.Title>
        <Card.Divider />
        {latestMeasurement ? (
          <View>
            <View style={styles.readingRow}>
              <Icon name="thermometer" type="font-awesome-5" color={theme.colors.primary} />
              <Text style={styles.readingLabel}>Temperature:</Text>
              <Text style={styles.readingValue}>{latestMeasurement.water_temperature}°C</Text>
            </View>
            <View style={styles.readingRow}>
              <Icon name="flask" type="font-awesome-5" color={theme.colors.primary} />
              <Text style={styles.readingLabel}>pH Level:</Text>
              <Text style={styles.readingValue}>{latestMeasurement.ph_level}</Text>
            </View>
            <View style={styles.readingRow}>
              <Icon name="tint" type="font-awesome-5" color={theme.colors.primary} />
              <Text style={styles.readingLabel}>EC Level:</Text>
              <Text style={styles.readingValue}>{latestMeasurement.ec_level} mS/cm</Text>
            </View>
            <View style={styles.readingRow}>
              <Icon name="leaf" type="font-awesome-5" color={theme.colors.primary} />
              <Text style={styles.readingLabel}>Nitrogen:</Text>
              <Text style={styles.readingValue}>{latestMeasurement.nitrogen_level} ppm</Text>
            </View>
            <View style={styles.readingRow}>
              <Icon name="seedling" type="font-awesome-5" color={theme.colors.primary} />
              <Text style={styles.readingLabel}>Phosphorus:</Text>
              <Text style={styles.readingValue}>{latestMeasurement.phosphorus_level} ppm</Text>
            </View>
            <View style={styles.readingRow}>
              <Icon name="apple-alt" type="font-awesome-5" color={theme.colors.primary} />
              <Text style={styles.readingLabel}>Potassium:</Text>
              <Text style={styles.readingValue}>{latestMeasurement.potassium_level} ppm</Text>
            </View>
            <Text style={styles.lastUpdated}>
              Last updated: {new Date(latestMeasurement.measured_at).toLocaleString()}
            </Text>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No measurements recorded yet</Text>
          </View>
        )}
        <Button
          title="Add New Measurement"
          onPress={onAddMeasurement}
          icon={{ name: 'add', color: 'white', type: 'material' }}
          buttonStyle={styles.button}
        />
      </Card>

      {/* Trends Charts */}
      {hasChartData ? (
        <Card containerStyle={styles.card}>
          <Card.Title>Parameter Trends</Card.Title>
          <Card.Divider />
          
          <Text style={styles.chartTitle}>pH Level Trend</Text>
          <InteractiveChartWithDateRange
            data={sortedMeasurements}
            mapFunction={mapPhToDataset}
            title=""
            unit=""
            height={220}
            width={screenWidth}
            testID="ph-trend-chart"
          />
          
          <Divider style={styles.chartDivider} />
          
          <Text style={styles.chartTitle}>EC Level Trend</Text>
          <InteractiveChartWithDateRange
            data={sortedMeasurements}
            mapFunction={mapEcToDataset}
            title=""
            unit="mS/cm"
            height={220}
            width={screenWidth}
            testID="ec-trend-chart"
          />
          
          <Divider style={styles.chartDivider} />
          
          <Text style={styles.chartTitle}>Temperature Trend</Text>
          <InteractiveChartWithDateRange
            data={sortedMeasurements}
            mapFunction={mapTempToDataset}
            title=""
            unit="°C"
            height={220}
            width={screenWidth}
            testID="temperature-trend-chart"
          />
        </Card>
      ) : (
        latestMeasurement && (
          <Card containerStyle={styles.card}>
            <Card.Title>Parameter Trends</Card.Title>
            <Card.Divider />
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                Need at least 2 measurements to display trends
              </Text>
            </View>
          </Card>
        )
      )}

      {/* Quick Actions Card */}
      <Card containerStyle={styles.card}>
        <Card.Title>Quick Actions</Card.Title>
        <Card.Divider />
        <View style={styles.quickActionsContainer}>
          <Button
            title="Add Reminder"
            onPress={onCreateReminder}
            icon={{ name: 'notifications', color: 'white', type: 'material' }}
            buttonStyle={styles.button}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 10,
    marginBottom: 10,
  },
  healthStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusMessage: {
    fontSize: 14,
    opacity: 0.7,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  readingLabel: {
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  readingValue: {
    fontSize: 16,
  },
  lastUpdated: {
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 10,
    opacity: 0.7,
    textAlign: 'right',
  },
  chartTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  chart: {
    borderRadius: 10,
    marginVertical: 8,
  },
  chartDivider: {
    marginVertical: 15,
  },
  quickActionsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  button: {
    borderRadius: 8,
    marginVertical: 5,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    opacity: 0.7,
    textAlign: 'center',
  },
}); 