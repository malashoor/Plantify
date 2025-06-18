import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useIdentifyPlant, PlantIdentification } from '../../hooks/useIdentifyPlant';

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

export default function IdentifyScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const { identifyPlant, isLoading, error } = useIdentifyPlant();
  const [identification, setIdentification] = useState<PlantIdentification | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      // Request media library permissions
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraPermission.status === 'granted' && mediaPermission.status === 'granted') {
        setHasPermissions(true);
      } else {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library access are required to identify plants.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => ImagePicker.requestCameraPermissionsAsync() },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const takePhoto = async () => {
    if (!hasPermissions) {
      await requestPermissions();
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setIdentification(null); // Clear previous results
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    if (!hasPermissions) {
      await requestPermissions();
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setIdentification(null); // Clear previous results
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleIdentifyPlant = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please take a photo or select an image first.');
      return;
    }

    try {
      const result = await identifyPlant(selectedImage);
      setIdentification(result);
    } catch (err) {
      console.error('Failed to identify plant:', err);
      Alert.alert('Error', 'Failed to identify plant. Please try again.');
    }
  };

  const retakePhoto = () => {
    setSelectedImage(null);
    setIdentification(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Identify Plant</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View
          style={[
            styles.instructionCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons
            name="camera"
            size={32}
            color={theme.colors.primary}
            style={styles.instructionIcon}
          />
          <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
            Plant Identification
          </Text>
          <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
            Take a clear photo of the plant's leaves, flowers, or overall structure for best
            results.
          </Text>
        </View>

        {/* Image Preview */}
        {selectedImage && (
          <View
            style={[
              styles.imagePreviewCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              onPress={retakePhoto}
              style={[styles.retakeButton, { backgroundColor: theme.colors.textSecondary }]}
            >
              <Ionicons name="refresh" size={16} color="white" />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Camera Actions */}
        {!selectedImage && (
          <View style={styles.cameraActions}>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: theme.colors.primary }]}
              onPress={takePhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.galleryButton,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
              onPress={pickFromGallery}
              activeOpacity={0.8}
            >
              <Ionicons name="images" size={24} color={theme.colors.primary} />
              <Text style={[styles.galleryButtonText, { color: theme.colors.primary }]}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Identify Button */}
        {selectedImage && (
          <TouchableOpacity
            style={[
              styles.identifyButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleIdentifyPlant}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <Ionicons name="hourglass" size={20} color="white" />
                <Text style={styles.identifyButtonText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="search" size={20} color="white" />
                <Text style={styles.identifyButtonText}>Identify Plant</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Error Display */}
        {error && (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.error },
            ]}
          >
            <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              Failed to identify plant. Please try again with a clearer photo.
            </Text>
          </View>
        )}

        {/* Results */}
        {identification && (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.resultHeader}>
              <Ionicons name="leaf" size={24} color={theme.colors.success} />
              <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
                {identification.name}
              </Text>
            </View>

            <Text style={[styles.scientific, { color: theme.colors.textSecondary }]}>
              {identification.scientificName}
            </Text>

            <View style={styles.confidenceContainer}>
              <Text style={[styles.confidenceLabel, { color: theme.colors.textSecondary }]}>
                Confidence:
              </Text>
              <View
                style={[
                  styles.confidenceBadge,
                  {
                    backgroundColor:
                      identification.confidence > 0.7 ? theme.colors.success : theme.colors.warning,
                  },
                ]}
              >
                <Text style={styles.confidenceText}>
                  {Math.round(identification.confidence * 100)}%
                </Text>
              </View>
            </View>

            {identification.confidence < 0.5 && (
              <View
                style={[
                  styles.warningContainer,
                  {
                    backgroundColor: theme.colors.warning + '20',
                    borderColor: theme.colors.warning,
                  },
                ]}
              >
                <Ionicons name="warning" size={16} color={theme.colors.warning} />
                <Text style={[styles.warningText, { color: theme.colors.warning }]}>
                  Low confidence - try a clearer photo for better results!
                </Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.carePlanButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push(`/plants/${identification.id}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="book" size={16} color="white" />
                <Text style={styles.carePlanButtonText}>View Care Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.plantCareButton,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
                ]}
                onPress={() => {
                  try {
                    console.log('🌱 Direct navigation to Plant Care');
                    router.push(`/plant-care/${identification.id}`);
                  } catch (error) {
                    console.error('Navigation error:', error);
                    Alert.alert(
                      'Navigation Error',
                      'Could not open Plant Care screen. Please try again.'
                    );
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="leaf" size={16} color={theme.colors.primary} />
                <Text style={[styles.plantCareButtonText, { color: theme.colors.primary }]}>
                  Plant Care Guide
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips */}
        <View
          style={[
            styles.tipsCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
            Tips for Better Results
          </Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                Use good lighting (natural light works best)
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                Focus on leaves, flowers, or distinctive features
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                Keep the plant centered in the frame
              </Text>
            </View>
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
  instructionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  instructionIcon: {
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  imagePreviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cameraActions: {
    gap: 12,
    marginBottom: 20,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  identifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  identifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  resultCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  scientific: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 14,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  carePlanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  carePlanButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  plantCareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 6,
  },
  plantCareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});
