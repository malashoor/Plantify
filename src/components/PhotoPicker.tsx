import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PhotoPickerProps {
  onImageSelected: (uri: string) => void;
  initialImage?: string | null;
  disabled?: boolean;
}

export function PhotoPicker({ onImageSelected, initialImage, disabled = false }: PhotoPickerProps) {
  const handlePickImage = () => {
    if (disabled) return;
    
    // Mock image selection - in a real app this would use expo-image-picker
    const mockImageUri = 'https://example.com/mock-plant-image.jpg';
    onImageSelected(mockImageUri);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.picker, disabled && styles.pickerDisabled]} 
        onPress={handlePickImage}
        disabled={disabled}
      >
        {initialImage ? (
          <Image source={{ uri: initialImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera" size={48} color="#999" />
            <Text style={styles.placeholderText}>Tap to select photo</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  picker: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  pickerDisabled: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
}); 