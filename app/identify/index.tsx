import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Camera, PermissionResponse } from 'expo-camera';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/theme/spacing';
import { Colors } from '@/theme/colors';
import { Leaf } from 'lucide-react-native';
import { useIdentifyPlant, PlantIdentification } from '@/hooks/useIdentifyPlant';
import { router } from 'expo-router';

export default function IdentifyScreen(): JSX.Element {
  // TODO: Replace `any` with proper Expo Camera types once upstream typings land
  // See: https://github.com/expo/expo/issues/XXXXX
  // Our type definitions in types/expo-camera.d.ts can be used as a reference
  const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { identifyPlant, isLoading, error } = useIdentifyPlant();
  const [identification, setIdentification] = useState<PlantIdentification | null>(null);
  
  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      const response = await Camera.requestCameraPermissionsAsync();
      setHasPermission(response.status === 'granted');
    })();
  }, []);

  const requestPermission = async () => {
    const response = await Camera.requestCameraPermissionsAsync();
    setHasPermission(response.status === 'granted');
  };
  
  const onSnap = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.7, 
        base64: true,
        exif: false // Disable EXIF to reduce file size
      });
      const result = await identifyPlant(photo.uri);
      setIdentification(result);
    } catch (err) {
      console.error('Failed to identify plant:', err);
    }
  };
  
  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Card style={styles.card}>
          <Text style={styles.message}>Requesting camera permission...</Text>
        </Card>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Card style={styles.card}>
          <Text style={styles.message}>
            Camera access is required to identify plants.
          </Text>
          <Button 
            variant="primary" 
            onPress={requestPermission}
            accessibilityLabel="Grant camera permission"
          >
            Grant Permission
          </Button>
          <Button 
            variant="secondary" 
            onPress={() => router.back()}
            style={{ marginTop: Spacing.SM }}
            accessibilityLabel="Go back to previous screen"
          >
            Go Back
          </Button>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <View style={styles.preview}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type="back"
          ratio="4:3"
          autoFocus="on"
          whiteBalance="auto"
        />
      </View>

      {/* Capture Button */}
      <View style={styles.controls}>
        <Button 
          variant="primary" 
          onPress={onSnap}
          disabled={isLoading}
          accessibilityLabel="Take photo to identify plant"
        >
          {isLoading ? 'Analyzing...' : 'Take Photo'}
        </Button>
      </View>

      {/* Results */}
      {error && (
        <Card style={styles.card}>
          <Text style={[styles.message, { color: Colors.Error }]}>
            Failed to identify plant. Please try again.
          </Text>
          <Button 
            variant="primary"
            onPress={onSnap}
            style={{ marginTop: Spacing.SM }}
            accessibilityLabel="Retry plant identification"
          >
            Retry
          </Button>
        </Card>
      )}

      {identification && (
        <Card style={styles.card}>
          <Text style={styles.title}>{identification.name}</Text>
          <Text style={styles.subtitle}>{identification.scientificName}</Text>
          
          {/* Confidence Score */}
          <Text style={styles.confidence}>
            Confidence: {Math.round(identification.confidence * 100)}%
          </Text>
          
          {/* Low Confidence Warning */}
          {identification.confidence < 0.5 && (
            <Text style={[styles.message, { color: Colors.Error, marginTop: Spacing.SM }]}>
              I'm not sure this is a plant. Try again!
            </Text>
          )}
          
          {/* Care Instructions CTA */}
          <Button 
            variant="secondary" 
            onPress={() => router.push(`/plants/${identification.id}`)}
            style={{ marginTop: Spacing.MD }}
            accessibilityLabel={`View care plan for ${identification.name}`}
          >
            View Care Plan
          </Button>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.Background 
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 3,
    margin: Spacing.MD,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    } : {
      elevation: 5,
    }),
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: Spacing.MD,
    paddingHorizontal: Spacing.MD,
  },
  card: {
    marginHorizontal: Spacing.MD,
    padding: Spacing.MD,
    backgroundColor: Colors.Background,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    } : {
      elevation: 5,
    }),
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: Spacing.MD,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.SM,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.XS,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: Spacing.XS,
  },
  confidence: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: Spacing.XS,
  },
}); 