import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HydroponicSystemHealth } from '../../components/hydroponics/HydroponicSystemHealth';
import { MeasurementForm } from '../../components/hydroponics/MeasurementForm';
import { NutrientChart } from '../../components/hydroponics/NutrientChart';
import { HydroponicReminderForm } from '../../components/hydroponics/HydroponicReminderForm';
import { useHydroponics } from '../../hooks/useHydroponics';
import { useReminders } from '../../hooks/useReminders';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    error: '#F44336',
  }
});

// Custom Card component
const Card = ({ children, style, title }: { children: React.ReactNode; style?: any; title?: string }) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  
  return (
    <View style={[styles.cardBase, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
      {title && (
        <>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
          <View style={[styles.cardDivider, { backgroundColor: theme.colors.border }]} />
        </>
      )}
      {children}
    </View>
  );
};

// Custom Button component
const Button = ({ 
  title, 
  onPress, 
  iconName,
  theme,
  style,
  disabled = false,
  loading = false
}: { 
  title: string; 
  onPress: () => void; 
  iconName?: keyof typeof Ionicons.glyphMap;
  theme: any;
  style?: any;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      { backgroundColor: disabled ? '#E0E0E0' : theme.colors.primary },
      style
    ]} 
    onPress={onPress}
    disabled={disabled || loading}
  >
    <View style={styles.buttonContent}>
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          {iconName && (
            <Ionicons 
              name={iconName} 
              size={20} 
              color="white" 
              style={styles.buttonIcon} 
            />
          )}
          <Text style={styles.buttonText}>{title}</Text>
        </>
      )}
    </View>
  </TouchableOpacity>
);

// Custom Tab component
const TabButton = ({ 
  title, 
  iconName, 
  isActive, 
  onPress, 
  theme 
}: { 
  title: string; 
  iconName: keyof typeof Ionicons.glyphMap; 
  isActive: boolean; 
  onPress: () => void;
  theme: any;
}) => (
  <TouchableOpacity 
    style={[
      styles.tabButton, 
      { 
        backgroundColor: isActive ? theme.colors.primary : 'transparent',
        borderBottomColor: isActive ? theme.colors.primary : theme.colors.border
      }
    ]} 
    onPress={onPress}
  >
    <Ionicons 
      name={iconName} 
      size={20} 
      color={isActive ? 'white' : theme.colors.text} 
    />
    <Text style={[
      styles.tabButtonText, 
      { color: isActive ? 'white' : theme.colors.text }
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default function HydroponicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const { useSystem, addMeasurement, deleteMeasurement } = useHydroponics();
  const { data: system, isLoading, error } = useSystem(id);
  const { createReminder } = useReminders('hydroponic');
  const [isAddMeasurementVisible, setIsAddMeasurementVisible] = useState(false);
  const [isAddReminderVisible, setIsAddReminderVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const handleDeleteMeasurement = useCallback(async (measurementId: string) => {
    try {
      await deleteMeasurement.mutateAsync({ systemId: id, measurementId });
    } catch (error) {
      // Error is handled by the hook
    }
  }, [id, deleteMeasurement]);

  const handleMeasurementSubmit = useCallback(async (data) => {
    try {
      await addMeasurement.mutateAsync({
        systemId: id,
        measurement: data
      });
      setIsAddMeasurementVisible(false);
    } catch (error) {
      // Error is handled by the hook
    }
  }, [id, addMeasurement]);

  const handleReminderSubmit = useCallback(async (data) => {
    try {
      await createReminder.mutateAsync({
        title: data.title,
        type: 'hydroponic',
        related_id: id,
        trigger_date: data.trigger_date,
        repeat_interval: data.repeat_interval,
        context_type: 'hydroponic',
        priority: data.priority || 'medium',
        emotion_tone: data.emotion_tone || 'neutral',
        category: data.category || 'daily_check'
      });
      setIsAddReminderVisible(false);
    } catch (error) {
      // Error is handled by the hook
    }
  }, [id, createReminder]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !system) {
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load hydroponic system details"
        onRetry={() => router.replace('/hydroponics')}
      />
    );
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return (
          <HydroponicSystemHealth
            system={system}
            onAddMeasurement={() => setIsAddMeasurementVisible(true)}
            onCreateReminder={() => setIsAddReminderVisible(true)}
          />
        );
      case 1:
        return (
          <ScrollView style={styles.tabContent}>
            <Button
              title="Add Measurement"
              iconName="add"
              onPress={() => setIsAddMeasurementVisible(true)}
              theme={theme}
              style={styles.addButton}
            />
            <View style={styles.measurements}>
              {system.measurements.map((measurement) => (
                <Card 
                  key={measurement.id}
                  title={new Date(measurement.measured_at).toLocaleString()}
                >
                  <View style={styles.measurementDetails}>
                    <Text style={[styles.measurementText, { color: theme.colors.text }]}>
                      pH: {measurement.ph_level}
                    </Text>
                    <Text style={[styles.measurementText, { color: theme.colors.text }]}>
                      EC: {measurement.ec_level} mS/cm
                    </Text>
                    <Text style={[styles.measurementText, { color: theme.colors.text }]}>
                      Temperature: {measurement.water_temperature}°C
                    </Text>
                  </View>
                  <Button
                    iconName="trash"
                    title="Delete"
                    onPress={() => handleDeleteMeasurement(measurement.id)}
                    loading={deleteMeasurement.isPending}
                    disabled={deleteMeasurement.isPending}
                    theme={theme}
                    style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                  />
                </Card>
              ))}
            </View>
          </ScrollView>
        );
      case 2:
        return (
          <ScrollView style={styles.tabContent}>
            <NutrientChart
              measurements={system.measurements}
              type="nutrients"
              title="Nutrient Levels"
            />
            <NutrientChart
              measurements={system.measurements}
              type="ph"
              title="pH Levels"
            />
            <NutrientChart
              measurements={system.measurements}
              type="ec"
              title="EC Levels"
            />
            <NutrientChart
              measurements={system.measurements}
              type="temperature"
              title="Temperature"
            />
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Custom Tab Navigation */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}>
        <TabButton
          title="Overview"
          iconName="grid"
          isActive={selectedTab === 0}
          onPress={() => setSelectedTab(0)}
          theme={theme}
        />
        <TabButton
          title="Measurements"
          iconName="water"
          isActive={selectedTab === 1}
          onPress={() => setSelectedTab(1)}
          theme={theme}
        />
        <TabButton
          title="Charts"
          iconName="bar-chart"
          isActive={selectedTab === 2}
          onPress={() => setSelectedTab(2)}
          theme={theme}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Measurement Form Modal */}
      <Modal
        isVisible={isAddMeasurementVisible}
        onBackdropPress={() => setIsAddMeasurementVisible(false)}
        backdropOpacity={0.8}
        animationIn="slideInUp"
        style={styles.modal}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <MeasurementForm
            systemId={id}
            onSubmit={handleMeasurementSubmit}
            isLoading={addMeasurement.isPending}
            onCancel={() => setIsAddMeasurementVisible(false)}
          />
        </View>
      </Modal>

      {/* Reminder Form Modal */}
      <Modal
        isVisible={isAddReminderVisible}
        onBackdropPress={() => setIsAddReminderVisible(false)}
        backdropOpacity={0.8}
        animationIn="slideInUp"
        style={styles.modal}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <HydroponicReminderForm
            onSubmit={handleReminderSubmit}
            onCancel={() => setIsAddReminderVisible(false)}
            isLoading={createReminder.isPending}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  cardBase: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDivider: {
    height: 1,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    marginBottom: 16,
  },
  deleteButton: {
    marginTop: 12,
  },
  measurements: {
    marginTop: 8,
  },
  measurementDetails: {
    marginBottom: 12,
  },
  measurementText: {
    fontSize: 14,
    marginBottom: 4,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: '80%',
  },
});
