import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReminders } from '../../hooks/useReminders';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#1E1E1E' : '#F8F9FA',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#212121',
    textSecondary: colorScheme === 'dark' ? '#AAAAAA' : '#757575',
    border: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
});

const CATEGORIES = [
  { id: 'watering', name: 'Watering', icon: 'water', description: 'Water your plants' },
  { id: 'fertilizing', name: 'Fertilizing', icon: 'leaf', description: 'Apply nutrients' },
  { id: 'pruning', name: 'Pruning', icon: 'cut', description: 'Trim and prune' },
  { id: 'monitoring', name: 'Monitoring', icon: 'eye', description: 'Check plant health' },
  { id: 'general', name: 'General', icon: 'notifications', description: 'General care task' },
];

const FREQUENCIES = [
  { id: 'once', name: 'Once', description: 'One-time reminder' },
  { id: 'daily', name: 'Daily', description: 'Repeat every day' },
  { id: 'weekly', name: 'Weekly', description: 'Repeat every week' },
];

export default function NewReminderScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const router = useRouter();
  const { addReminder } = useReminders();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<
    'watering' | 'fertilizing' | 'pruning' | 'monitoring' | 'general'
  >('watering');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly'>('daily');
  const [plantName, setPlantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create reminder for 1 hour from now as default
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + 1);

      await addReminder({
        title: title.trim(),
        description: description.trim(),
        time: reminderTime,
        frequency,
        isCompleted: false,
        plantName: plantName.trim() || undefined,
        category,
        isActive: true,
      });

      Alert.alert('Success!', 'Reminder created successfully.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New Reminder</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>
            Create Plant Care Reminder
          </Text>
          <Text style={[styles.formSubtitle, { color: theme.colors.textSecondary }]}>
            Set up automated reminders for your plant care tasks
          </Text>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: errors.title ? theme.colors.error : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={title}
              onChangeText={text => {
                setTitle(text);
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              placeholder="Enter reminder title (e.g., Water tomatoes)"
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={100}
            />
            {errors.title && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.title}</Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor:
                        category === cat.id ? theme.colors.primary : theme.colors.background,
                      borderColor: category === cat.id ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat.id as any)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={category === cat.id ? 'white' : theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.categoryName,
                      { color: category === cat.id ? 'white' : theme.colors.text },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Frequency</Text>
            <View style={styles.frequencyList}>
              {FREQUENCIES.map(freq => (
                <TouchableOpacity
                  key={freq.id}
                  style={[
                    styles.frequencyCard,
                    {
                      backgroundColor:
                        frequency === freq.id ? theme.colors.primary : theme.colors.background,
                      borderColor:
                        frequency === freq.id ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setFrequency(freq.id as any)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.frequencyName,
                      { color: frequency === freq.id ? 'white' : theme.colors.text },
                    ]}
                  >
                    {freq.name}
                  </Text>
                  <Text
                    style={[
                      styles.frequencyDescription,
                      { color: frequency === freq.id ? 'white' : theme.colors.textSecondary },
                    ]}
                  >
                    {freq.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Plant Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Plant Name (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={plantName}
              onChangeText={setPlantName}
              placeholder="Enter plant name (e.g., Cherry Tomatoes)"
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={50}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add any additional details..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={[styles.characterCount, { color: theme.colors.textSecondary }]}>
              {description.length}/200 characters
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              (!title.trim() || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!title.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <Ionicons name="hourglass" size={20} color="white" />
                <Text style={styles.submitButtonText}>Creating...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>Create Reminder</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Reminder Tips</Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              Reminders will be scheduled for 1 hour from now by default. You can edit the time
              later from the reminders list.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
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
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minWidth: '45%',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  frequencyList: {
    gap: 8,
  },
  frequencyCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  frequencyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  frequencyDescription: {
    fontSize: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
