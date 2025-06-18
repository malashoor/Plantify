---
name: Expo Camera TypeScript Issues
about: Report TypeScript issues with expo-camera
title: '[TypeScript] expo-camera type definition issues'
labels: 'bug, typescript, expo-camera'
assignees: ''
---

## Environment

- Expo SDK Version: 0.22.26
- expo-camera Version: 16.1.6
- TypeScript Version: (run `tsc --version` to get this)
- Platform: iOS/Android

## Issue Description

The expo-camera package has TypeScript definition issues that prevent proper type checking of the Camera component and its methods.

## TypeScript Errors

```typescript
// Error 1: Camera type reference
const cameraRef = useRef<Camera>(null);
// Error: 'Camera' refers to a value, but is being used as a type here.

// Error 2: Camera component usage
<Camera ref={cameraRef} type="back" />
// Error: JSX element type 'Camera' does not have any construct or call signatures.
// Error: 'Camera' cannot be used as a JSX component.
```

## Minimal Reproduction

```typescript
import { Camera } from 'expo-camera';
import { useRef } from 'react';

export default function CameraScreen() {
  const cameraRef = useRef<Camera>(null);

  return (
    <Camera
      ref={cameraRef}
      type="back"
    />
  );
}
```

## Current Workarounds

1. Using `any` type for the camera ref:

```typescript
const cameraRef = useRef<any>(null);
```

2. Custom type definitions in `types/expo-camera.d.ts`:

```typescript
declare module 'expo-camera' {
  export interface CameraProps extends ViewProps {
    type?: 'front' | 'back';
    ratio?: string;
    ref?: React.RefObject<Camera>;
  }

  export class Camera extends Component<CameraProps> {
    takePictureAsync(options?: { quality?: number; base64?: boolean; exif?: boolean }): Promise<{
      uri: string;
      width: number;
      height: number;
      base64?: string;
    }>;
  }
}
```

## Additional Context

- This issue affects projects using TypeScript with expo-camera
- The current workarounds are not ideal as they either bypass type checking or require maintaining custom type definitions
- Consider using `react-native-vision-camera` as an alternative with better TypeScript support
