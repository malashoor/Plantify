import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherAlert, WeatherAlertService } from '../../services/WeatherAlertService';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

interface WeatherAlertsProps {
  onAlertPress?: (alert: WeatherAlert) => void;
}

const AlertIcon = {
  heat: 'thermometer-high',
  cold: 'thermometer-low',
  wind: 'weather-windy',
  humidity: 'water-percent',
  rain: 'weather-pouring',
} as const;

const AlertColor = {
  warning: '#FFA726',
  critical: '#EF5350',
  info: '#42A5F5',
} as const;

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ onAlertPress }) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const cachedAlerts = await WeatherAlertService.getCachedAlerts();
    // Filter out acknowledged alerts and sort by severity and timestamp
    const activeAlerts = cachedAlerts
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => {
        if (a.severity === 'critical' && b.severity !== 'critical') return -1;
        if (a.severity !== 'critical' && b.severity === 'critical') return 1;
        return b.timestamp - a.timestamp;
      });
    setAlerts(activeAlerts);
  };

  const handleAlertPress = async (alert: WeatherAlert) => {
    await WeatherAlertService.acknowledgeAlert(alert.id);
    onAlertPress?.(alert);
    loadAlerts(); // Refresh the list
  };

  if (alerts.length === 0) return null;

  return (
    <ScrollView style={styles.container} horizontal showsHorizontalScrollIndicator={false}>
      {alerts.map(alert => (
        <Animated.View
          key={alert.id}
          entering={FadeInUp}
          exiting={FadeOutDown}
          style={[
            styles.alertContainer,
            {
              backgroundColor: theme.dark ? theme.colors.elevation.level2 : theme.colors.background,
              borderColor: AlertColor[alert.severity],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.alertContent}
            onPress={() => handleAlertPress(alert)}
            accessibilityRole="button"
            accessibilityLabel={`${alert.message}. ${alert.recommendation}`}
            accessibilityHint={t('accessibility.tapToAcknowledge')}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={AlertIcon[alert.type]}
                size={24}
                color={AlertColor[alert.severity]}
              />
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[styles.message, { color: AlertColor[alert.severity] }]}
                numberOfLines={1}
              >
                {alert.message}
              </Text>
              <Text style={styles.recommendation} numberOfLines={2}>
                {alert.recommendation}
              </Text>
              {alert.affectedPlants && alert.affectedPlants.length > 0 && (
                <Text style={styles.affectedPlants} numberOfLines={1}>
                  {t('alerts.affectedPlants')}: {alert.affectedPlants.join(', ')}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  alertContainer: {
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 280,
    maxWidth: 320,
  },
  alertContent: {
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendation: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  affectedPlants: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
