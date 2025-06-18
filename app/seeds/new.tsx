import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useSeeds } from '../../hooks/useSeeds';
import { supabase } from '../../lib/supabase';
import { SeedFormData } from '../../types/seed';

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#1E1E1E' : '#F5F5F5',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    error: '#F44336',
  },
});

// Custom Input Component
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  theme,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  theme: any;
}) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.text,
        },
        multiline && { height: numberOfLines * 40, textAlignVertical: 'top' },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
  </View>
);

// Custom Button Component
const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'filled',
  style,
  theme,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
  style?: any;
  theme: any;
}) => {
  const isDisabled = disabled || loading;
  const backgroundColor =
    variant === 'outline'
      ? 'transparent'
      : isDisabled
        ? theme.colors.textSecondary
        : theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor: theme.colors.primary,
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            {
              color: variant === 'outline' ? theme.colors.primary : 'white',
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default function NewSeedScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const { loading, error, createSeed } = useSeeds();
  const [formData, setFormData] = useState<SeedFormData>({
    name: '',
    species: '',
    variety: '',
    plantedDate: new Date(),
    imageUrl: undefined,
    notes: '',
  });
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        await uploadImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Error picking image:', err);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.split('/').pop() || 'image.jpg';
      const filePath = `seeds/${Date.now()}_${filename}`;

      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (err) {
      console.error('Error uploading image:', err);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.species) {
      Alert.alert('Missing Information', 'Please fill in at least the seed name and species.');
      return;
    }

    try {
      const seed = await createSeed(formData);
      if (seed) {
        router.push('/seeds');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create seed entry');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Add New Seed</Text>

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
              <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
            </View>
          )}

          <Input
            label="Seed Name *"
            value={formData.name}
            onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="e.g., My First Tomato"
            autoCapitalize="words"
            theme={theme}
          />

          <Input
            label="Species *"
            value={formData.species}
            onChangeText={text => setFormData(prev => ({ ...prev, species: text }))}
            placeholder="e.g., Solanum lycopersicum"
            autoCapitalize="words"
            theme={theme}
          />

          <Input
            label="Variety (Optional)"
            value={formData.variety}
            onChangeText={text => setFormData(prev => ({ ...prev, variety: text }))}
            placeholder="e.g., Beefsteak"
            autoCapitalize="words"
            theme={theme}
          />

          <Input
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={text => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Add any additional notes..."
            multiline
            numberOfLines={3}
            theme={theme}
          />

          <View style={styles.imageSection}>
            <Text style={[styles.imageLabel, { color: theme.colors.text }]}>Seed Image</Text>
            <TouchableOpacity
              style={[
                styles.imageButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={pickImage}
              disabled={uploading}
            >
              <View style={styles.imageButtonContent}>
                {uploading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Ionicons
                    name={image ? 'camera' : 'camera-outline'}
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
                <Text style={[styles.imageButtonText, { color: theme.colors.primary }]}>
                  {uploading ? 'Uploading...' : image ? 'Change Image' : 'Select Image'}
                </Text>
              </View>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.preview} />}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelButton}
              theme={theme}
            />
            <Button
              title="Add Seed"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || uploading || !formData.name || !formData.species}
              style={styles.submitButton}
              theme={theme}
            />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  error: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  imageButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonContent: {
    alignItems: 'center',
  },
  imageButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
