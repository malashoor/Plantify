import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput } from '../components/common';
import { useRetryableOperation } from '../hooks/useRetryableOperation';
import { RetryOperationKeys } from '../services/RetryOperations';
import { useTheme } from '../hooks/useTheme';
import { JournalEntry } from '../types/api';
import { RetryQueueStatus } from '../components/common/RetryQueueStatus';
import { MoodSelector } from '../components/journal/MoodSelector';
import { PlantSelector } from '../components/journal/PlantSelector';

interface JournalEntryScreenProps {
  entry?: JournalEntry;
  isNew?: boolean;
}

export function JournalEntryScreen({ entry, isNew = false }: JournalEntryScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const [formData, setFormData] = useState<Partial<JournalEntry>>(
    entry || {
      mood: 3,
      note: '',
      plantId: null,
      images: [],
    }
  );

  // Add journal entry with retry support
  const addEntry = useRetryableOperation(RetryOperationKeys.ADD_JOURNAL_ENTRY, 'new-entry', {
    priority: 'high',
    maxRetries: 3,
    showFeedback: true,
    onSuccess: savedEntry => {
      // After saving the entry, log the plant mood if a plant was selected
      if (savedEntry.plantId && savedEntry.mood) {
        logPlantMood.execute(savedEntry.plantId, savedEntry.mood, savedEntry.note);
      }
      router.back();
    },
  });

  // Update journal entry with retry support
  const updateEntry = useRetryableOperation(
    RetryOperationKeys.UPDATE_JOURNAL_ENTRY,
    entry?.id || '',
    {
      priority: 'medium',
      maxRetries: 3,
      showFeedback: true,
      onSuccess: updatedEntry => {
        // After updating the entry, log the plant mood if it changed
        if (updatedEntry.plantId && updatedEntry.mood && updatedEntry.mood !== entry?.mood) {
          logPlantMood.execute(updatedEntry.plantId, updatedEntry.mood, updatedEntry.note);
        }
        router.back();
      },
    }
  );

  // Log plant mood with retry support
  const logPlantMood = useRetryableOperation(
    RetryOperationKeys.LOG_PLANT_MOOD,
    `plant-mood-${formData.plantId || 'new'}`,
    {
      priority: 'low',
      maxRetries: 2,
      showFeedback: false,
      // This operation depends on the entry being saved first
      dependencies: isNew ? ['new-entry'] : undefined,
    }
  );

  const handleSave = async () => {
    if (!formData.note?.trim()) {
      // Show validation error
      return;
    }

    if (isNew) {
      addEntry.execute(formData);
    } else if (entry?.id) {
      updateEntry.execute(entry.id, formData);
    }
  };

  const isProcessing =
    addEntry.isProcessing || updateEntry.isProcessing || logPlantMood.isProcessing;

  const hasError = addEntry.error || updateEntry.error || logPlantMood.error;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <MoodSelector
          value={formData.mood}
          onChange={mood => setFormData(prev => ({ ...prev, mood }))}
          disabled={isProcessing}
        />

        <PlantSelector
          value={formData.plantId}
          onChange={plantId => setFormData(prev => ({ ...prev, plantId }))}
          disabled={isProcessing}
        />

        <TextInput
          label="Note"
          value={formData.note}
          onChangeText={note => setFormData(prev => ({ ...prev, note }))}
          placeholder="How are you and your plants feeling today?"
          multiline
          numberOfLines={4}
          disabled={isProcessing}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={isNew ? 'Add Entry' : 'Save Changes'}
            onPress={handleSave}
            disabled={isProcessing || !formData.note?.trim()}
            loading={addEntry.isProcessing || updateEntry.isProcessing}
          />
        </View>

        {hasError && (
          <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{hasError.message}</Text>
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
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
});
