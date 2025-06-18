import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  }
});

const SYSTEM_TYPES = [
  { id: 'nft', name: 'NFT', description: 'Nutrient Film Technique', icon: 'water' },
  { id: 'dwc', name: 'DWC', description: 'Deep Water Culture', icon: 'flask' },
  { id: 'wick', name: 'Wick', description: 'Passive Hydroponic System', icon: 'leaf' },
  { id: 'ebb-flow', name: 'Ebb and Flow', description: 'Flood and Drain System', icon: 'repeat' },
  { id: 'aeroponics', name: 'Aeroponics', description: 'Air-based Growing', icon: 'cloud' },
];

const STORAGE_KEY = '@greensai_hydroponic_systems';

interface HydroponicSystem {
  id: string;
  name: string;
  type: string;
  notes: string;
  createdAt: Date;
  status: 'active' | 'maintenance' | 'inactive';
}

export default function NewHydroponicScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [type, setType] = useState('NFT');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!name.trim()) {
      newErrors.name = 'System name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'System name must be at least 2 characters';
    }

    if (!type) {
      newErrors.type = 'Please select a system type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSystem = async (system: HydroponicSystem) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const existingSystems = stored ? JSON.parse(stored) : [];
      const updatedSystems = [...existingSystems, system];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSystems));
    } catch (error) {
      console.error('Error saving system:', error);
      throw new Error('Failed to save system');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const newSystem: HydroponicSystem = {
        id: Date.now().toString(),
        name: name.trim(),
        type,
        notes: notes.trim(),
        createdAt: new Date(),
        status: 'active',
      };

      await saveSystem(newSystem);
      
      Alert.alert(
        'Success!',
        `Hydroponic system "${newSystem.name}" has been created successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/hydroponics')
          }
        ]
      );
    } catch (error) {
      console.error('Error creating system:', error);
      Alert.alert(
        'Error',
        'Failed to create hydroponic system. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemTypeIcon = (systemType: string) => {
    const type = SYSTEM_TYPES.find(t => t.name === systemType);
    return type?.icon || 'hardware-chip';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New System</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>
            Create Hydroponic System
          </Text>
          <Text style={[styles.formSubtitle, { color: theme.colors.textSecondary }]}>
            Set up a new hydroponic system to monitor and manage
          </Text>

          {/* System Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>System Name *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: errors.name ? theme.colors.error : theme.colors.border,
                  color: theme.colors.text
                }
              ]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              placeholder="Enter system name (e.g., Kitchen Herbs NFT)"
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={50}
            />
            {errors.name && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.name}
              </Text>
            )}
          </View>

          {/* System Type */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>System Type *</Text>
            <Text style={[styles.labelSubtext, { color: theme.colors.textSecondary }]}>
              Choose the hydroponic method you'll be using
            </Text>
            
            <View style={styles.typeGrid}>
              {SYSTEM_TYPES.map((systemType) => (
                <TouchableOpacity
                  key={systemType.id}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: type === systemType.name ? theme.colors.primary : theme.colors.background,
                      borderColor: type === systemType.name ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => setType(systemType.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={systemType.icon as any}
                    size={24}
                    color={type === systemType.name ? 'white' : theme.colors.primary}
                  />
                  <Text style={[
                    styles.typeName,
                    { color: type === systemType.name ? 'white' : theme.colors.text }
                  ]}>
                    {systemType.name}
                  </Text>
                  <Text style={[
                    styles.typeDescription,
                    { color: type === systemType.name ? 'white' : theme.colors.textSecondary }
                  ]}>
                    {systemType.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Notes</Text>
            <Text style={[styles.labelSubtext, { color: theme.colors.textSecondary }]}>
              Optional details about your setup, plants, or maintenance schedule
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any additional notes about your system..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={[styles.characterCount, { color: theme.colors.textSecondary }]}>
              {notes.length}/500 characters
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              (!name.trim() || !type || isLoading) && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!name.trim() || !type || isLoading}
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
                <Text style={styles.submitButtonText}>Create System</Text>
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
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Getting Started</Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              After creating your system, you can monitor pH levels, nutrient concentrations, and set up automated reminders for maintenance tasks.
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
    marginBottom: 4,
  },
  labelSubtext: {
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
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
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  typeDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
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
