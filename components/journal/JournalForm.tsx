import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface JournalFormData {
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
}

interface JournalFormProps {
  initialData?: Partial<JournalFormData>;
  onSubmit: (data: JournalFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    primary: '#45B36B',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
  }
});

const MOOD_OPTIONS = [
  { key: 'excellent', label: 'Excellent', icon: 'happy', color: '#4CAF50' },
  { key: 'good', label: 'Good', icon: 'happy-outline', color: '#8BC34A' },
  { key: 'okay', label: 'Okay', icon: 'remove-circle-outline', color: '#FFC107' },
  { key: 'poor', label: 'Poor', icon: 'sad-outline', color: '#FF9800' },
  { key: 'terrible', label: 'Terrible', icon: 'sad', color: '#F44336' },
];

export const JournalForm: React.FC<JournalFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const [formData, setFormData] = useState<JournalFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    mood: initialData?.mood || '',
    tags: initialData?.tags || [],
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your journal entry.');
      return;
    }

    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please add some content to your journal entry.');
      return;
    }

    onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const selectMood = (mood: string) => {
    setFormData(prev => ({
      ...prev,
      mood: prev.mood === mood ? '' : mood,
    }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Title *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Enter a title for your journal entry..."
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={100}
          />
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Content *</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.content}
            onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
            placeholder="Write about your plant's progress, observations, or thoughts..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        {/* Mood Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Plant Health Mood</Text>
          <View style={styles.moodContainer}>
            {MOOD_OPTIONS.map((mood) => (
              <TouchableOpacity
                key={mood.key}
                style={[
                  styles.moodOption,
                  {
                    backgroundColor: formData.mood === mood.key ? mood.color + '20' : theme.colors.surface,
                    borderColor: formData.mood === mood.key ? mood.color : theme.colors.border,
                  },
                ]}
                onPress={() => selectMood(mood.key)}
              >
                <Ionicons
                  name={mood.icon as any}
                  size={24}
                  color={formData.mood === mood.key ? mood.color : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    {
                      color: formData.mood === mood.key ? mood.color : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[
                styles.tagInput,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add a tag..."
              placeholderTextColor={theme.colors.textSecondary}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addTagButton, { backgroundColor: theme.colors.primary }]}
              onPress={addTag}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {formData.tags && formData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Ionicons name="close" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Saving...' : 'Save Entry'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addTagButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    // backgroundColor will be set by theme
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 