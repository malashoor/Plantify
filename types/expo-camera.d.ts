import { Component, ComponentType } from 'react';
import { ViewProps } from 'react-native';

declare module 'expo-camera' {
  export const CameraType: {
    front: 'front';
    back: 'back';
  };

  export type FlashMode = 'on' | 'off' | 'auto' | 'torch';
  export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

  export interface CameraProps extends ViewProps {
    type?: 'front' | 'back';
    ratio?: string;
    flashMode?: FlashMode;
    autoFocus?: 'on' | 'off' | 'auto';
    whiteBalance?: 'auto' | 'sunny' | 'cloudy' | 'shadow' | 'incandescent' | 'fluorescent';
    zoom?: number;
  }

  export interface PermissionResponse {
    status: PermissionStatus;
    granted: boolean;
    canAskAgain: boolean;
  }

  export interface CameraInstance {
    takePictureAsync(options?: {
      quality?: number;
      base64?: boolean;
      exif?: boolean;
      skipProcessing?: boolean;
    }): Promise<{
      uri: string;
      width: number;
      height: number;
      base64?: string;
      exif?: any;
    }>;

    recordAsync(options?: {
      maxDuration?: number;
      maxFileSize?: number;
      quality?: number | string;
      mute?: boolean;
    }): Promise<{
      uri: string;
      durationMillis: number;
    }>;

    stopRecording(): Promise<void>;
  }

  export const Camera: ComponentType<CameraProps & { ref?: React.RefObject<CameraInstance> }> & {
    getCameraPermissionsAsync(): Promise<PermissionResponse>;
    requestCameraPermissionsAsync(): Promise<PermissionResponse>;
    getMicrophonePermissionsAsync(): Promise<PermissionResponse>;
    requestMicrophonePermissionsAsync(): Promise<PermissionResponse>;
  };

  export default Camera;
} 