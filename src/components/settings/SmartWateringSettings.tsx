import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text, useTheme, Divider, List } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SmartWateringService } from '../../services/SmartWateringService';
import Slider from '@react-native-community/slider';

export const SmartWateringSettings: React.FC = () => {
  const [preferences, setPreferences] = useState({
    enabled: true,
    rainSkipThreshold: 5,
    heatIncreaseThreshold: 30,
    windSpeedThreshold: 15,
    lowHumidityThreshold: 30,
  });

  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await SmartWateringService.getPreferences();
    setPreferences(prefs);
  };

  const handleToggle = async (value: boolean) => {
    const updated = { ...preferences, enabled: value };
    await SmartWateringService.setPreferences(updated);
    setPreferences(updated);
  };

  const handleSliderChange = async (value: number, key: keyof typeof preferences) => {
    const updated = { ...preferences, [key]: value };
    await SmartWateringService.setPreferences(updated);
    setPreferences(updated);
  };

  return (
    <View style={styles.container}>
      <List.Item
        title={t('settings.smartWatering.title')}
        description={t('settings.smartWatering.description')}
        left={props => <List.Icon {...props} icon="water-sync" />}
        right={() => (
          <Switch
            value={preferences.enabled}
            onValueChange={handleToggle}
            accessibilityLabel={t('settings.smartWatering.toggle')}
          />
        )}
      />

      {preferences.enabled && (
        <>
          <Divider />
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              {t('settings.smartWatering.rainThreshold', {
                value: preferences.rainSkipThreshold,
              })}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={20}
              step={1}
              value={preferences.rainSkipThreshold}
              onValueChange={value => handleSliderChange(value, 'rainSkipThreshold')}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.surfaceVariant}
              thumbTintColor={theme.colors.primary}
            />
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              {t('settings.smartWatering.heatThreshold', {
                value: preferences.heatIncreaseThreshold,
              })}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={20}
              maximumValue={40}
              step={1}
              value={preferences.heatIncreaseThreshold}
              onValueChange={value => handleSliderChange(value, 'heatIncreaseThreshold')}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.surfaceVariant}
              thumbTintColor={theme.colors.primary}
            />
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              {t('settings.smartWatering.windThreshold', {
                value: preferences.windSpeedThreshold,
              })}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={30}
              step={1}
              value={preferences.windSpeedThreshold}
              onValueChange={value => handleSliderChange(value, 'windSpeedThreshold')}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.surfaceVariant}
              thumbTintColor={theme.colors.primary}
            />
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              {t('settings.smartWatering.humidityThreshold', {
                value: preferences.lowHumidityThreshold,
              })}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={50}
              step={1}
              value={preferences.lowHumidityThreshold}
              onValueChange={value => handleSliderChange(value, 'lowHumidityThreshold')}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.surfaceVariant}
              thumbTintColor={theme.colors.primary}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sliderLabel: {
    marginBottom: 8,
    opacity: 0.8,
  },
  slider: {
    height: 40,
  },
});
