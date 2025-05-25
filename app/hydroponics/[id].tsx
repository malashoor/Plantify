import { Text, Button, Card, Icon } from '@rneui/themed';
import { Tab, TabView } from '@rneui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { HydroponicSystemHealth } from '@/components/hydroponics/HydroponicSystemHealth';
import { MeasurementForm } from '@/components/hydroponics/MeasurementForm';
import { NutrientChart } from '@/components/hydroponics/NutrientChart';
import { HydroponicReminderForm } from '@/components/hydroponics/HydroponicReminderForm';
import { useHydroponics } from '@/hooks/useHydroponics';
import { useReminders } from '@/app/hooks/useReminders';
import { View, StyleSheet, ScrollView } from 'react-native';
import Modal from 'react-native-modal';

export default function HydroponicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

  return (
    <View style={styles.container}>
      <Tab
        value={selectedTab}
        onChange={setSelectedTab}
        indicatorStyle={{ backgroundColor: 'blue' }}
      >
        <Tab.Item
          title="Overview"
          icon={{ name: 'dashboard', type: 'material' }}
        />
        <Tab.Item
          title="Measurements"
          icon={{ name: 'water', type: 'material-community' }}
        />
        <Tab.Item
          title="Charts"
          icon={{ name: 'chart-line', type: 'material-community' }}
        />
      </Tab>

      <TabView value={selectedTab} onChange={setSelectedTab} animationType="spring">
        <TabView.Item style={styles.tabContent}>
          <HydroponicSystemHealth
            system={system}
            onAddMeasurement={() => setIsAddMeasurementVisible(true)}
            onCreateReminder={() => setIsAddReminderVisible(true)}
          />
        </TabView.Item>
        
        <TabView.Item style={styles.tabContent}>
          <ScrollView>
            <Button
              title="Add Measurement"
              icon={{ name: 'add', color: 'white' }}
              onPress={() => setIsAddMeasurementVisible(true)}
              containerStyle={styles.addButton}
            />
            <View style={styles.measurements}>
              {system.measurements.map((measurement) => (
                <Card key={measurement.id}>
                  <Card.Title>
                    {new Date(measurement.measured_at).toLocaleString()}
                  </Card.Title>
                  <Card.Divider />
                  <View style={styles.measurementDetails}>
                    <Text>pH: {measurement.ph_level}</Text>
                    <Text>EC: {measurement.ec_level} mS/cm</Text>
                    <Text>Temperature: {measurement.water_temperature}°C</Text>
                  </View>
                  <Button
                    icon={<Icon name="delete" color="white" />}
                    title="Delete"
                    onPress={() => handleDeleteMeasurement(measurement.id)}
                    loading={deleteMeasurement.isPending}
                    disabled={deleteMeasurement.isPending}
                  />
                </Card>
              ))}
            </View>
          </ScrollView>
        </TabView.Item>
        
        <TabView.Item style={styles.tabContent}>
          <ScrollView>
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
        </TabView.Item>
      </TabView>

      {/* Measurement Form Modal */}
      <Modal
        isVisible={isAddMeasurementVisible}
        onBackdropPress={() => setIsAddMeasurementVisible(false)}
        backdropOpacity={0.8}
        animationIn="slideInUp"
        style={styles.modal}
      >
        <View style={styles.modalContent}>
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
        <View style={styles.modalContent}>
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
    backgroundColor: '#f5f5f5',
  },
  details: {
    padding: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  measurements: {
    marginTop: 20,
  },
  measurementDetails: {
    marginBottom: 10,
  },
  tabContent: {
    width: '100%',
  },
  addButton: {
    margin: 16,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: '80%',
  },
});
