/// <reference types="react" />
/// <reference types="react-native" />

declare module 'expo-image' {
  import { ImageProps } from 'react-native';
  export interface ImageProps extends ImageProps {
    contentFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  }
  export const Image: React.FC<ImageProps>;
}

declare module 'react-native-reanimated' {
  export * from 'react-native-reanimated/lib/reanimated2';
}

declare module 'react-native-gesture-handler' {
  export * from 'react-native-gesture-handler/lib/typescript';
}

declare module 'react-i18next' {
  export function useTranslation(): {
    t: (key: string, defaultValue?: string) => string;
  };
}

// Fix for React Native JSX components
declare module 'react-native' {
  interface ViewProps {
    children?: React.ReactNode;
  }
  interface TextProps {
    children?: React.ReactNode;
  }
  interface TouchableOpacityProps {
    children?: React.ReactNode;
  }
  interface TextInputProps {
    editable?: boolean;
  }
  interface ActivityIndicatorProps {
    color?: string;
    size?: 'small' | 'large' | number;
  }

  export const View: React.FC<ViewProps>;
  export const Text: React.FC<TextProps>;
  export const TextInput: React.FC<TextInputProps>;
  export const TouchableOpacity: React.FC<TouchableOpacityProps>;
  export const ActivityIndicator: React.FC<ActivityIndicatorProps>;
  export const ScrollView: React.FC<ViewProps>;
}

// Fix for React JSX
declare module 'react' {
  interface ReactElement {
    children?: React.ReactNode;
  }
  
  // Add missing React hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: React.Context<T>): T;
} 