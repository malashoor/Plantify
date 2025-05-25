import { useTheme } from '@rneui/themed';
import { Button, Input } from '@rneui/themed';
import React, { useState } from 'react';

import { View, StyleSheet, ScrollView } from 'react-native';

import type { JournalEntry } from '../../types/journal';
import { ImagePicker } from '../common/ImagePicker';
import { PlantSelector } from '../common/PlantSelector';
import { VoiceInput } from '../common/VoiceInput';

import { EmojiPickerModal } from './EmojiPickerModal';

interface JournalFormProps {
  initialValues?: Partial<JournalEntry>;
  onSubmit: (values: Omit<JournalEntry, 'id' | 'created_at'>) => Promise<void>;
}

export function JournalForm({ initialValues, onSubmit }: JournalFormProps) {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formData, setFormData] = useState({
    plantId: initialValues?.plantId || '',
    plantName: initialValues?.plantName || '',
    emoji: initialValues?.emoji || '🌱',
    note: initialValues?.note || '',
    photo: initialValues?.photo || '',
  });

  const handleSubmit = async () => {
    if (!formData.plantId || !formData.note) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlantSelect = (plant: { id: string; name: string }) => {
    setFormData(prev => ({
      ...prev,
      plantId: plant.id,
      plantName: plant.name,
    }));
  };

  const handleEmojiSelect = (emoji: string) => {
    setFormData(prev => ({ ...prev, emoji }));
    setShowEmojiPicker(false);
  };

  const handlePhotoSelect = (uri: string) => {
    setFormData(prev => ({ ...prev, photo: uri }));
  };

  const handleNoteChange = (text: string) => {
    setFormData(prev => ({ ...prev, note: text }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <PlantSelector
          value={formData.plantId}
          onSelect={handlePlantSelect}
          accessibilityLabel="Select plant"
        />

        <View style={styles.emojiContainer}>
          <Button
            title={formData.emoji}
            onPress={() => setShowEmojiPicker(true)}
            type="outline"
            containerStyle={styles.emojiButton}
            accessibilityLabel="Select emoji"
            accessibilityHint="Double tap to open emoji picker"
          />
        </View>

        <View style={styles.noteContainer}>
          <Input
            label="Note"
            value={formData.note}
            onChangeText={handleNoteChange}
            multiline
            numberOfLines={4}
            placeholder="How is your plant doing today?"
            accessibilityLabel="Journal entry note"
            accessibilityHint="Enter your notes about the plant"
            rightIcon={<VoiceInput onTextChange={handleNoteChange} disabled={isSubmitting} />}
          />
        </View>

        <ImagePicker
          value={formData.photo}
          onChange={handlePhotoSelect}
          accessibilityLabel="Add plant photo"
          accessibilityHint="Double tap to select a photo from your gallery"
        />

        <Button
          title="Save Entry"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!formData.plantId || !formData.note || isSubmitting}
          containerStyle={styles.submitButton}
          accessibilityLabel="Save journal entry"
          accessibilityHint="Double tap to save your journal entry"
        />
      </View>

      <EmojiPickerModal
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  emojiContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emojiButton: {
    width: 80,
  },
  noteContainer: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
  },
}); 