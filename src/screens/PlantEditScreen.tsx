import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput } from '../components/common';
import { useRetryableOperation } from '../hooks/useRetryableOperation';
import { RetryOperationKeys } from '../services/RetryOperations';
import { useTheme } from '../hooks/useTheme';
import { Plant } from '../types/api';
import { RetryQueueStatus } from '../components/common/RetryQueueStatus';

interface PlantEditScreenProps {
  plant?: Plant;
  isNew?: boolean;
}

export function PlantEditScreen({ plant, isNew = false }: PlantEditScreenProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [formData, setFormData] = useState<Partial<Plant>>(plant || {});

  // Save plant operation with retry support
  const savePlant = useRetryableOperation(
    RetryOperationKeys.SAVE_PLANT,
    plant?.id || 'new',
    {
      priority: 'high',
      maxRetries: 3,
      showFeedback: true,
      onSuccess: (savedPlant) => {
        router.back();
      }
    }
  );

  // Update plant operation with retry support
  const updatePlant = useRetryableOperation(
    RetryOperationKeys.UPDATE_PLANT,
    plant?.id || '',
    {
      priority: 'medium',
      maxRetries: 3,
      showFeedback: true,
      onSuccess: () => {
        router.back();
      }
    }
  );

  // Delete plant operation with retry support
  const deletePlant = useRetryableOperation(
    RetryOperationKeys.DELETE_PLANT,
    plant?.id || '',
    {
      priority: 'low',
      maxRetries: 2,
      showFeedback: true,
      onSuccess: () => {
        router.back();
      }
    }
  );

  // Update watering schedule with retry support
  const updateSchedule = useRetryableOperation(
    RetryOperationKeys.UPDATE_WATERING_SCHEDULE,
    plant?.id || '',
    {
      priority: 'medium',
      maxRetries: 3,
      // This operation depends on the plant being saved first
      dependencies: isNew ? ['save-plant'] : undefined
    }
  );

  const handleSave = async () => {
    if (isNew) {
      savePlant.execute(formData);
    } else if (plant?.id) {
      updatePlant.execute(plant.id, formData);
    }
  };

  const handleDelete = async () => {
    if (plant?.id) {
      deletePlant.execute(plant.id);
    }
  };

  const handleScheduleUpdate = async (schedule: any) => {
    if (plant?.id) {
      updateSchedule.execute(plant.id, schedule);
    }
  };

  const isProcessing = 
    savePlant.isProcessing || 
    updatePlant.isProcessing || 
    deletePlant.isProcessing ||
    updateSchedule.isProcessing;

  const hasError = 
    savePlant.error || 
    updatePlant.error || 
    deletePlant.error ||
    updateSchedule.error;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <TextInput
          label="Plant Name"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          disabled={isProcessing}
        />

        <TextInput
          label="Species"
          value={formData.species}
          onChangeText={(text) => setFormData(prev => ({ ...prev, species: text }))}
          disabled={isProcessing}
        />

        <TextInput
          label="Location"
          value={formData.location}
          onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
          disabled={isProcessing}
        />

        {/* Add more form fields as needed */}

        <View style={styles.buttonContainer}>
          <Button
            title={isNew ? "Add Plant" : "Save Changes"}
            onPress={handleSave}
            disabled={isProcessing}
            loading={savePlant.isProcessing || updatePlant.isProcessing}
          />

          {!isNew && (
            <Button
              title="Delete Plant"
              onPress={handleDelete}
              variant="destructive"
              disabled={isProcessing}
              loading={deletePlant.isProcessing}
            />
          )}
        </View>

        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {hasError.message}
            </Text>
            <Button
              title="Retry"
              onPress={handleSave}
              variant="secondary"
              disabled={isProcessing}
            />
          </View>
        )}
      </ScrollView>

      {/* Show retry queue status */}
      <RetryQueueStatus showDetails={__DEV__} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  }
}); 