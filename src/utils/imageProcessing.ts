import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-js';
import * as FileSystem from 'expo-file-system';
import DeviceInfo from 'react-native-device-info';
import AnalyticsService from '../services/analytics';

// Global configuration
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DIMENSION: 2048,
  MIN_DIMENSION: 200,
  QUALITY: {
    HIGH: 0.9,
    MEDIUM: 0.7,
    LOW: 0.5,
  },
  MEMORY_THRESHOLD: 0.8, // 80% of available memory
  TEMP_DIRECTORY: `${FileSystem.cacheDirectory}ImageManipulator`,
} as const;

export class ImageProcessingError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  format: 'jpeg' | 'png';
}

interface ProcessingOptions {
  maxDimension?: number;
  quality?: number;
  format?: 'jpeg' | 'png';
}

interface CompressOptions {
  width?: number;
  quality?: number;
  format?: ImageManipulator.SaveFormat;
}

export async function checkImageSize(uri: string): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new ImageProcessingError('Image file does not exist', 'FILE_NOT_FOUND');
    }
    return fileInfo.size || 0;
  } catch (error) {
    throw new ImageProcessingError('Failed to check image size', 'SIZE_CHECK_FAILED');
  }
}

export async function checkMemoryAvailability(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const memory = await DeviceInfo.getFreeDiskStorage();
      const totalMemory = await DeviceInfo.getTotalDiskStorage();
      return memory / totalMemory > 1 - IMAGE_CONFIG.MEMORY_THRESHOLD;
    } catch {
      // If we can't check memory, assume it's okay but log warning
      console.warn('Unable to check memory availability');
      return true;
    }
  }
  // iOS handles memory management differently
  return true;
}

export async function compressImage(uri: string, options: CompressOptions = {}): Promise<string> {
  const { width = 1024, quality = 0.7, format = ImageManipulator.SaveFormat.JPEG } = options;

  try {
    const manipResult = await ImageManipulator.manipulateAsync(uri, [{ resize: { width } }], {
      compress: quality,
      format,
    });
    return manipResult.uri;
  } catch (error) {
    console.error('Failed to compress image:', error);
    throw new Error('Image compression failed');
  }
}

export async function cleanup(uri: string): Promise<void> {
  if (!uri) return;

  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Failed to cleanup file:', error);
    // We don't throw here as cleanup failures are non-critical
  }
}

export async function cleanupTemporaryImages(uris: string[]): Promise<void> {
  await Promise.all(uris.map(cleanup));
}

export function calculateMemoryRequirement(
  width: number,
  height: number,
  bytesPerPixel: number = 4
): number {
  // Calculate raw bitmap size in memory
  return width * height * bytesPerPixel;
}

export async function validateImage(uri: string): Promise<boolean> {
  try {
    // Check if file exists and is readable
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return false;
    }

    // Try to load image metadata
    await ImageManipulator.manipulateAsync(uri, [], { compress: 1 });

    return true;
  } catch {
    return false;
  }
}

export async function compressImage(uri: string, options = {}) {
  const manipResult = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1024 } }], {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
    ...options,
  });
  return manipResult.uri;
}

export async function cleanup(uri: string) {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // ignore cleanup errors
  }
}
