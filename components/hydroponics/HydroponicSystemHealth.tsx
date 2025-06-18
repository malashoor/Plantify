import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Measurement {
  id: string;
  ph_level: number;
  ec_level: number;
  water_temperature: number;
  measured_at: string;
}

interface HydroponicSystem {
  id: string;
  name: string;
  type: string;
  status: string;
  measurements: Measurement[];
  created_at: string;
}

interface HydroponicSystemHealthProps {
  system: HydroponicSystem;
  onAddMeasurement: () => void;
  onCreateReminder: () => void;
}

const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    primary: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    success: '#4CAF50',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
  }
});

const Card: React.FC<{ 
  children: React.ReactNode; 
  style?: any; 
  title?: string;
  theme: any;
}> = ({ children, style, title, theme }) => (
  <View style={[
    styles.card, 
    { 
      backgroundColor: theme.colors.surface, 
      borderColor: theme.colors.border 
    }, 
    style
  ]}>
    {title && (
      <>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
        <View style={[styles.cardDivider, { backgroundColor: theme.colors.border }]} />
      </>
    )}
    {children}
  </View>
);

const MetricCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  status: 'good' | 'warning' | 'error';
  theme: any;
}> = ({ icon, label, value, status, theme }) => {
  const statusColors = {
    good: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  };

  return (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={20} color={statusColors[status]} />
        <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, { color: statusColors[status] }]}>{value}</Text>
    </View>
  );
};

export const HydroponicSystemHealth: React.FC<HydroponicSystemHealthProps> = ({
  system,
  onAddMeasurement,
  onCreateReminder,
}) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const getLatestMeasurement = (): Measurement | null => {
    if (system.measurements.length === 0) return null;
    return system.measurements.reduce((latest, current) => 
      new Date(current.measured_at) > new Date(latest.measured_at) ? current : latest
    );
  };

  const getHealthStatus = (measurement: Measurement | null) => {
    if (!measurement) return { status: 'error', message: 'No measurements available' };

    const { ph_level, ec_level, water_temperature } = measurement;
    
    // Ideal ranges for most hydroponic plants
    const phGood = ph_level >= 5.5 && ph_level <= 6.5;
    const ecGood = ec_level >= 1.2 && ec_level <= 2.0;
    const tempGood = water_temperature >= 18 && water_temperature <= 24;

    if (phGood && ecGood && tempGood) {
      return { status: 'good', message: 'System is healthy' };
    } else if (!phGood && !ecGood && !tempGood) {
      return { status: 'error', message: 'Multiple parameters need attention' };
    } else {
      return { status: 'warning', message: 'Some parameters need adjustment' };
    }
  };

  const getMetricStatus = (value: number, min: number, max: number): 'good' | 'warning' | 'error' => {
    if (value >= min && value <= max) return 'good';
    if ((value >= min - 0.5 && value < min) || (value > max && value <= max + 0.5)) return 'warning';
    return 'error';
  };

  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours === 0) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  const latestMeasurement = getLatestMeasurement();
  const healthStatus = getHealthStatus(latestMeasurement);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* System Status Card */}
      <Card title="System Status" theme={theme}>
        <View style={styles.statusContainer}>
          <View style={styles.statusInfo}>
            <Text style={[styles.systemName, { color: theme.colors.text }]}>{system.name}</Text>
            <Text style={[styles.systemType, { color: theme.colors.textSecondary }]}>{system.type}</Text>
            <View style={styles.healthIndicator}>
              <Ionicons 
                name={healthStatus.status === 'good' ? 'checkmark-circle' : 
                      healthStatus.status === 'warning' ? 'warning' : 'alert-circle'} 
                size={16} 
                color={
                  healthStatus.status === 'good' ? theme.colors.success :
                  healthStatus.status === 'warning' ? theme.colors.warning : theme.colors.error
                } 
              />
              <Text style={[
                styles.healthMessage, 
                { 
                  color: healthStatus.status === 'good' ? theme.colors.success :
                         healthStatus.status === 'warning' ? theme.colors.warning : theme.colors.error
                }
              ]}>
                {healthStatus.message}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Latest Measurements */}
      {latestMeasurement ? (
        <Card title="Latest Measurements" theme={theme}>
          <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>
            Last updated: {formatTimeSince(latestMeasurement.measured_at)}
          </Text>
          
          <View style={styles.metricsGrid}>
            <MetricCard
              icon="water"
              label="pH Level"
              value={latestMeasurement.ph_level.toFixed(1)}
              status={getMetricStatus(latestMeasurement.ph_level, 5.5, 6.5)}
              theme={theme}
            />
            <MetricCard
              icon="flash"
              label="EC Level"
              value={`${latestMeasurement.ec_level.toFixed(1)} mS/cm`}
              status={getMetricStatus(latestMeasurement.ec_level, 1.2, 2.0)}
              theme={theme}
            />
            <MetricCard
              icon="thermometer"
              label="Water Temp"
              value={`${latestMeasurement.water_temperature.toFixed(1)}°C`}
              status={getMetricStatus(latestMeasurement.water_temperature, 18, 24)}
              theme={theme}
            />
          </View>
        </Card>
      ) : (
        <Card title="No Measurements" theme={theme}>
          <View style={styles.noDataContainer}>
            <Ionicons name="bar-chart-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
              No measurements recorded yet. Add your first measurement to start monitoring system health.
            </Text>
          </View>
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="Quick Actions" theme={theme}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={onAddMeasurement}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.actionButtonText}>Add Measurement</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
            onPress={onCreateReminder}
          >
            <Ionicons name="alarm" size={20} color="white" />
            <Text style={styles.actionButtonText}>Set Reminder</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* System Information */}
      <Card title="System Information" theme={theme}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>System Type:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>{system.type}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Status:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>{system.status}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Created:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {new Date(system.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Total Measurements:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>{system.measurements.length}</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDivider: {
    height: 1,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  systemName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  systemType: {
    fontSize: 14,
    marginBottom: 8,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthMessage: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 250,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 