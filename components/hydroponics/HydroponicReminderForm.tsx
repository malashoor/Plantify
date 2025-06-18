import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HydroponicReminderFormData {
  title: string;
  trigger_date: string;
  repeat_interval?: 'daily' | 'weekly' | 'monthly' | 'none';
  priority: 'low' | 'medium' | 'high';
  emotion_tone: 'neutral' | 'encouraging' | 'urgent';
  category: 'daily_check' | 'nutrient_change' | 'ph_adjustment' | 'maintenance' | 'harvest';
}

interface HydroponicReminderFormProps {
  onSubmit: (data: HydroponicReminderFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    primary: '#4CAF50',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  }
});

const REPEAT_OPTIONS = [
  { key: 'none', label: 'No Repeat', icon: 'remove-circle-outline' },
  { key: 'daily', label: 'Daily', icon: 'today' },
  { key: 'weekly', label: 'Weekly', icon: 'calendar' },
  { key: 'monthly', label: 'Monthly', icon: 'calendar-outline' },
];

const PRIORITY_OPTIONS = [
  { key: 'low', label: 'Low', icon: 'arrow-down', color: '#4CAF50' },
  { key: 'medium', label: 'Medium', icon: 'remove', color: '#FF9800' },
  { key: 'high', label: 'High', icon: 'arrow-up', color: '#F44336' },
];

const EMOTION_OPTIONS = [
  { key: 'neutral', label: 'Neutral', icon: 'remove-circle-outline' },
  { key: 'encouraging', label: 'Encouraging', icon: 'happy-outline' },
  { key: 'urgent', label: 'Urgent', icon: 'warning-outline' },
];

const CATEGORY_OPTIONS = [
  { key: 'daily_check', label: 'Daily Check', icon: 'eye' },
  { key: 'nutrient_change', label: 'Nutrient Change', icon: 'water' },
  { key: 'ph_adjustment', label: 'pH Adjustment', icon: 'flask' },
  { key: 'maintenance', label: 'Maintenance', icon: 'construct' },
  { key: 'harvest', label: 'Harvest', icon: 'leaf' },
];

export const HydroponicReminderForm: React.FC<HydroponicReminderFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const [formData, setFormData] = useState<HydroponicReminderFormData>({
    title: '',
    trigger_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    repeat_interval: 'none',
    priority: 'medium',
    emotion_tone: 'neutral',
    category: 'daily_check',
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the reminder.');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.trigger_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Alert.alert('Error', 'Please select a date that is today or in the future.');
      return;
    }

    onSubmit(formData);
  };

  const updateField = <K extends keyof HydroponicReminderFormData>(
    field: K,
    value: HydroponicReminderFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Set Reminder</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Schedule a hydroponic system reminder
        </Text>
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.inputContainer}>
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
            onChangeText={(value) => updateField('title', value)}
            placeholder="Enter reminder title..."
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={100}
          />
        </View>

        {/* Date */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Date *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.trigger_date}
            onChangeText={(value) => updateField('trigger_date', value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textSecondary}
          />
          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Selected: {formatDate(formData.trigger_date)}
          </Text>
        </View>

        {/* Category */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
          <View style={styles.optionsGrid}>
            {CATEGORY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: formData.category === option.key ? theme.colors.primary + '20' : theme.colors.surface,
                    borderColor: formData.category === option.key ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => updateField('category', option.key as any)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={formData.category === option.key ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: formData.category === option.key ? theme.colors.primary : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Repeat Interval */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Repeat</Text>
          <View style={styles.optionsRow}>
            {REPEAT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: formData.repeat_interval === option.key ? theme.colors.primary + '20' : theme.colors.surface,
                    borderColor: formData.repeat_interval === option.key ? theme.colors.primary : theme.colors.border,
                    flex: 1,
                  },
                ]}
                onPress={() => updateField('repeat_interval', option.key as any)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={formData.repeat_interval === option.key ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionTextSmall,
                    {
                      color: formData.repeat_interval === option.key ? theme.colors.primary : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Priority</Text>
          <View style={styles.optionsRow}>
            {PRIORITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: formData.priority === option.key ? option.color + '20' : theme.colors.surface,
                    borderColor: formData.priority === option.key ? option.color : theme.colors.border,
                    flex: 1,
                  },
                ]}
                onPress={() => updateField('priority', option.key as any)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={formData.priority === option.key ? option.color : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionTextSmall,
                    {
                      color: formData.priority === option.key ? option.color : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emotion Tone */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Tone</Text>
          <View style={styles.optionsRow}>
            {EMOTION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: formData.emotion_tone === option.key ? theme.colors.primary + '20' : theme.colors.surface,
                    borderColor: formData.emotion_tone === option.key ? theme.colors.primary : theme.colors.border,
                    flex: 1,
                  },
                ]}
                onPress={() => updateField('emotion_tone', option.key as any)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={formData.emotion_tone === option.key ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionTextSmall,
                    {
                      color: formData.emotion_tone === option.key ? theme.colors.primary : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          
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
              {isLoading ? 'Creating...' : 'Create Reminder'}
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
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  form: {
    padding: 20,
    paddingTop: 0,
  },
  inputContainer: {
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
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minWidth: 80,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionTextSmall: {
    fontSize: 11,
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